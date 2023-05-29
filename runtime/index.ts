import isRelativeUrl from "is-relative-url";
import * as _ from 'lodash-es';
import Debug from "./debug";
import DOM from "./dom";
import isUrl = require('is-url');

declare const targetUrl: string, serverUrl: string;

const oldXHROpen = window.XMLHttpRequest.prototype.open;

// @ts-ignore
window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    const urlStr = _.toString(url);
    if (isUrl(urlStr) && !isRelativeUrl(urlStr))
        url = `${serverUrl}/mask?url=${url}`;
    return oldXHROpen.call(this, method, url, async, user, password);
};

window.history.pushState = _.constant(void 0);
window.history.replaceState = _.constant(void 0);

window.navigator.sendBeacon = _.constant(true);

Debug.log('✅ FreedomRuntime Loaded');
DOM.runDomClock();
