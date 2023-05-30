/// <reference types="user-agent-data-types" />

import isRelativeUrl from "is-relative-url";
import * as _ from 'lodash-es';
import validDataUrl from 'valid-data-url';

export default class Utils {

    static controlKey(event: KeyboardEvent) {
        return navigator.userAgentData.platform === 'macOS' ? event.metaKey : event.ctrlKey;
    }

    static rewriteUrl(url: string, origin: string = window['targetUrl']) {
        if (Utils.isUrlRewritten(url))
            return url;
        return `${window['serverUrl']}/mask?url=${btoa(encodeURIComponent(isRelativeUrl(url) ? _.toString(new URL(url, window['targetUrl'])) : url))}&origin=${btoa(encodeURIComponent(origin))}`;
    }

    static isUrlRewritten(url: string) {
        return url.startsWith(window['serverUrl']) || validDataUrl(url);
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
