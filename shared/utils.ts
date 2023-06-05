/// <reference types="user-agent-data-types" />

import {isBrowser} from "browser-or-node";
import isRelativeUrl from "is-relative-url";
import * as _ from 'lodash-es';
import validDataUrl from 'valid-data-url';
import Network from "../src/network";
import toDefault from "await-to-js";

declare const serverUrl: string, targetUrl: string;

export default class Utils {

    static toESM: typeof toDefault = isBrowser ? null as any : _.get(toDefault, 'default') as unknown as typeof toDefault;

    static controlKey(event: KeyboardEvent) {
        return navigator.userAgentData?.platform === 'macOS' ? event.metaKey : event.ctrlKey;
    }

    static rewriteUrl(url: string, origin: string = targetUrl) {
        if (Utils.isUrlRewritten(url))
            return url;
        return `${isBrowser ? serverUrl : Network.currentAddress}/mask?url=${btoa(encodeURIComponent(isRelativeUrl(url) ? _.toString(new URL(url, origin)) : url))}&origin=${btoa(encodeURIComponent(origin))}`;
    }

    static undoRewriteUrl(url: string) {
        if (!Utils.isUrlRewritten(url))
            return url;
        const params = new URLSearchParams(url.split('?')[1]);
        return decodeURIComponent(atob(params.get('url') ?? ''));
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

    static isEmptyOrSpaces(str: string){
        return str === null || str.match(/^ *$/) !== null;
    }

    static searchUrl(keyword: string) {
        return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
    }

    static isChromium = isBrowser ? !!navigator.userAgentData && navigator.userAgentData.brands.some(data => data.brand == 'Chromium') : false;
    static isChromeOS = isBrowser ? /\bCrOS\b/.test(navigator.userAgent) : false;

}
