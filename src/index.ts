import fastifyCors from '@fastify/cors';
import fastifyWebsocket from "@fastify/websocket";
import createBareServer from '@tomphttp/bare-server-node';
import arrayBufferToBuffer from 'arraybuffer-to-buffer';
import blocked from 'blocked-at';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import fastify from "fastify";
import fastifyGracefulShutdown from "fastify-graceful-shutdown";
import fs from "fs-extra";
import nodeHttp from 'http';
import {resolve} from "import-meta-resolve";
import * as _ from 'lodash-es';
import fetch from "node-fetch";
import * as path from "path";
import url from "url";
import Msgpack from "../shared/msgpack";
import Network from "./network";
import {cssAbsolutifyUrls, htmlAbsolutifyUrls} from "./preprocessing";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.argv.includes('--print-blocked'))
    blocked((time, stack) => {
        console.log(`❌ Event loop blocked for ${time}ms:`, _.join(stack, '\n'));
    });

dotenv.config();

const app = fastify({
    serverFactory: handler => {
        const httpServer = nodeHttp.createServer();
        const bareServer = createBareServer('/bare/');

        httpServer.on('request', async (req, res) => {
            if (bareServer.shouldRoute(req))
                await bareServer.routeRequest(req, res);
            else
                handler(req, res);
        });

        httpServer.on('upgrade', async (req, socket, head) => {
            if (bareServer.shouldRoute(req))
                await bareServer.routeUpgrade(req, socket, head);
        });

        return httpServer;
    },
    pluginTimeout: 10000,
    trustProxy: true
});
app.register(fastifyGracefulShutdown);
app.register(fastifyCors, {
    credentials: true
});
app.register(fastifyWebsocket);
app.register(async fastify => {
    fastify.get<{
        Querystring: {
            ip: string;
        }
    }>('/ws', {websocket: true}, (conn, req) => {
        console.log(`WS connection initiated from ${req.query.ip}`);

        conn.socket.on('error', err => {
            console.error(err);
        });

        conn.socket.on('message', async rawMessage => {
            const payload = JSON.parse(Msgpack.decodeFromString(_.toString(rawMessage)));
            const route = payload.route;
            const send = (payload: any, error: boolean = false) => {
                conn.socket.send(Msgpack.encodeToString(JSON.stringify(error ? {...payload, 'ogRoute': route} : {
                    ...payload,
                    'route': `${route}-response`
                })));
            }

            switch (route) {

                case 'get-html':
                    const url = new URL(payload.url)
                    const html = await Network.fetchHTML(url, req);
                    const $ = cheerio.load(html);
                    htmlAbsolutifyUrls(_.toString(url), $);
                    cssAbsolutifyUrls(_.toString(url), $);

                    $(`<base href="${Network.currentAddress}/mask" target="_blank" >`).appendTo('head');

                    const bareClientJS = await fs.readFile(resolve('@tomphttp/bare-client', import.meta.url).replace(/(^\w+:|^)\/\//, '').replace('.js', '.cjs'), 'utf-8');
                    const runtimeJS = await fs.readFile(path.join(__dirname, '..', 'dist', 'runtime.js'), 'utf-8');
                    const script = `
                    <script type="application/javascript">
                    window.targetUrl = '${_.toString(url)}';
                    window.serverUrl = '${Network.currentAddress}';
                    </script>
                    <script type="application/javascript">${bareClientJS}</script>
                    <script type="application/javascript">${runtimeJS}</script>
                    <script type="application/javascript">
                    (async () => {
                        try {
                            const bareClient = await createBareClient('${Network.currentAddress}/bare/');
                            window.ogFetch = window.fetch;
                            window.fetch = (input, init) => (bareClient.fetch(input, init));
                        } catch (err) {
                            console.error("[🚀 FreedomRuntime] ❌ Failed to connect to server", err);
                        } finally {
                            console.log("[🚀 FreedomRuntime] ✅ Initialised Bare Client");
                        }
                    })();
                    </script>
                    `;
                    $('head').append(script);

                    send({
                        html: $.html({
                            baseURI: _.toString(url)
                        })
                    });
                    break;

                case 'cookie-popup-blocker-get-block-list':
                    const response = await fetch('https://www.i-dont-care-about-cookies.eu/abp/');
                    const text = await response.text();

                    send({
                        blockList: text
                    });
                    break;

                default:
                    send({
                        error: `Unsupported route: ${route}`,
                        errorType: 'unsupported-route'
                    }, true);
            }
        });
    });
});

app.all<{
    Querystring: {
        url: string;
        origin: string;
    }
}>('/mask', async (req, res) => {
    const {url, origin} = _.mapValues(req.query, decodeURIComponent);
    if (_.isNil(url))
        return res.status(400).header('content-type', 'application/json').send({
            error: 'Missing URL',
            errorType: 'missing-url'
        });


    // pipe response
    const response = await fetch(url, {
        headers: _.merge(Network.defaultHeaders(req), _.pick(req.headers, ['accept'])),
        method: req.method,
        redirect: 'follow',
        follow: 10,
        ...(req.body ? {body: <any>req.body} : {})
    });
    if (!response.ok)
        return res.status(response.status).header('content-type', 'application/json').send({
            error: `Failed to fetch masked URL: ${response.statusText}`,
            errorType: 'fetch-failed'
        });
    const buffer = await response.arrayBuffer();

    // Remove content-encoding header to prevent double compression, and copy all other headers
    const responseHeaders = response.headers;
    responseHeaders.delete('content-encoding');
    responseHeaders.forEach((value, key) => res.header(_.toLower(key), value))

    res.header('access-control-allow-origin', 'null');
    res.header('origin', origin);
    return res.send(arrayBufferToBuffer(buffer));
});

app.post<{
    Body: {
        message: string;
    }
}>('/remote-log', async (req, res) => {
    const {message} = req.body;
    if (_.isNil(message))
        return res.status(400).send({
            error: 'Missing message',
            errorType: 'missing-message'
        });

    console.log(`[From FreedomRuntime 🚀] ${message}`);
    return res.send();
})

app.get('/launcher', async (request, reply) => {
    const html = (await fs.readFile(path.join(__dirname, '..', 'dist', 'index.html'))).toString('base64');
    const launcherHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <title>FreedomProxy</title>
    <script type="application/javascript">
    const win = window.open();
    win.document.write(atob('${html}'));
    win.document.close();
    window.location.assign('https://classroom.google.com');
    </script>
    </head>
    </html>
    `;

    return reply.header('content-type', 'text/html').send(launcherHtml);
})

const port = _.toNumber(process.env.PORT ?? 8080);
app.ready(async () => {
    await app.listen({
        port
    }, (err, address) => {
        if (err)
            console.error(err);

        console.log(`🚀 Server listening on ${address}`);
        Network.currentAddress = address.replace('[::1]', 'localhost');
    });
});

app.after(() => {
    app.gracefulShutdown((signal, next) => {
        console.log(`🛑 Received ${signal}, gracefully shutting down...`);
        next()
    })
})
