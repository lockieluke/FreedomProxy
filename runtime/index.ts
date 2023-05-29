import $ from 'cash-dom';
import isRelativeUrl from "is-relative-url";
import * as _ from 'lodash-es';
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

// Element.prototype.append = new Proxy(Element.prototype.append, {
//     apply(target, thisArg, argArray) {
//
//     }
// });

// Element.prototype.appendChild = new Proxy(Element.prototype.appendChild, {
//     apply(target, thisArg, argArray) {
//         const [child] = argArray;
//
//         const rewriteSrc = (elm: HTMLScriptElement | HTMLImageElement) => {
//             const src = elm.src;
//             console.log(src);
//             if (isUrl(src) && !isRelativeUrl(src) && !src.startsWith(serverUrl))
//                 elm.src = `${serverUrl}/mask?url=${src}`;
//         }
//         if (child instanceof HTMLScriptElement)
//             rewriteSrc(child);
//
//         if (child instanceof HTMLImageElement)
//             rewriteSrc(child);
//
//         return target.apply(thisArg, argArray);
//     }
// })

console.log('✅ FreedomRuntime Loaded');
DOM.runDomClock();
