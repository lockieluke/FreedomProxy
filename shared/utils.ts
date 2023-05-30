/// <reference types="user-agent-data-types" />

import {isBrowser} from "browser-or-node";
import isRelativeUrl from "is-relative-url";
import * as _ from 'lodash-es';
import validDataUrl from 'valid-data-url';
import Network from "../src/network";

declare const serverUrl: string, targetUrl: string;

export default class Utils {

    static controlKey(event: KeyboardEvent) {
        return navigator.userAgentData?.platform === 'macOS' ? event.metaKey : event.ctrlKey;
    }

    static rewriteUrl(url: string, origin: string = targetUrl) {
        if (Utils.isUrlRewritten(url))
            return url;
        return `${isBrowser ? serverUrl : Network.currentAddress}/mask?url=${btoa(encodeURIComponent(isRelativeUrl(url) ? _.toString(new URL(url, origin)) : url))}&origin=${btoa(encodeURIComponent(origin))}`;
    }

    static isUrlRewritten(url: string) {
        return url.startsWith(isBrowser ? serverUrl : Network.currentAddress) || validDataUrl(url);
    }

    static postMessageAndAwaitResponse(message: any, target: Window = parent) {
        return new Promise<Partial<{ type: string }>>((resolve, reject) => {
            const listener = (event: MessageEvent) => {
                const data = _.attempt(eventData => JSON.parse(eventData), _.toString(event.data));
                if (_.isError(data)) {
                    reject("Failed to parse message data");
                    return;
                }

                if (`${data['type']}` === `${message['type']}Res`) {
                    window.removeEventListener('message', listener);
                    resolve(data);
                }
            };
            window.addEventListener('message', listener);
            target.postMessage(message, '*');
        });
    }

}
