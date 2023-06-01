import {isNode} from "browser-or-node";
import {FastifyRequest} from "fastify";
import fetchCookie from "fetch-cookie";
import * as _ from 'lodash-es';
import Config from "./config";
import Utils from "../shared/utils";

export default class Network {

    static currentAddress: string;
    static defaultHeaders(req: FastifyRequest): HeadersInit {
        return isNode ? {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            'User-Agent': req.headers["user-agent"] ?? Config.DEFAULT_USER_AGENT,
            'sec-ch-ua': Config.DEFAULT_SEC_CH_UA,
            'sec-ch-ua-mobile': Config.DEFAULT_SEC_CH_UA_MOBILE,
            'sec-ch-ua-platform': Config.DEFAULT_SEC_CH_UA_PLATFORM,
            'sec-ch-ua-platform-version': Config.DEFAULT_SEC_CH_UA_PLATFORM_VERSION,
            'sec-ch-ua-full-version-list': Config.DEFAULT_SEC_CH_UA_FULL_VERSION_LIST,
            'sec-fetch-user': '?1',
            "sec-ch-ua-wow64": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            'upgrade-insecure-requests': '1',
            'dnt': '1',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9,de;q=0.8',
        } : {};
    }

    static async fetchHTML(url: URL, req: FastifyRequest): Promise<string> {
        const [err, response] = await Utils.toESM(Network.fetchWithCookie(_.toString(url), {
            headers: {
                ...Network.defaultHeaders(req)
            },
            redirect: 'follow',
            referrerPolicy: 'strict-origin-when-cross-origin',
            maxRedirect: 10
        }));
        if (err || !response.ok)
            throw new Error(`❌ Failed to fetch HTML from ${url}: ${response?.statusText}`);

        return await response.text();
    }

    static get fetchWithCookie() {
        return fetchCookie(fetch);
    }

}
