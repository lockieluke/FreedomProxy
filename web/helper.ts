import Msgpack from "../shared/msgpack";
import {ClientIPInfo} from "./analytics";

export default class Helper {

    private readonly ws: WebSocket;

    connected = false;

    constructor(ipInfo: ClientIPInfo, cb: (connected: boolean) => void = () => {}) {
        const ws = new WebSocket(`ws://localhost:8080/ws?ip=${ipInfo?.ipAddress ?? "0.0.0.0"}`);
        ws.addEventListener('error', err => {
            if (err)
                console.error(`❌ WS connection error: ${err}`);

            this.connected = false;
            cb(false);
        })
        ws.addEventListener('open', () => {
            console.log(`✅ WS connection initiated with ${ws.url}`);
            this.connected = true;
            cb(true);
        });

        this.ws = ws;
    }

    send(route: string, payload: any = {}) {
        return new Promise<any>((resolve, reject) => {
            const receiveCB = event => {
                const data = JSON.parse(Msgpack.decodeFromString(event.data));

                if (data.ogRoute === route && data.error) {
                    this.ws.removeEventListener('message', receiveCB);
                    reject(data.error);
                }

                if (data.route === `${route}-response`) {
                    this.ws.removeEventListener('message', receiveCB);
                    resolve(data);
                }
            }
            this.ws.addEventListener('message', receiveCB);

            this.ws.send(Msgpack.encodeToString(JSON.stringify({
                route,
                ...payload
            })));
        })
    }


}
