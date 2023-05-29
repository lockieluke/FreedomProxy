import * as _ from 'lodash-es';
import Debug from "./debug";
import DOM from "./dom";
import Utils from "./utils";

declare const targetUrl: string, serverUrl: string;

const oldXMLOpen = XMLHttpRequest.prototype.open;
// @ts-ignore
XMLHttpRequest.prototype.open = function (method: string, url: string, async: boolean, user?: string | null, password?: string | null) {
    return oldXMLOpen.call(this, method, Utils.rewriteUrl(url), async, user, password);
}

window.history.pushState = _.constant(void 0);
window.history.replaceState = _.constant(void 0);

window.navigator.sendBeacon = new Proxy(window.navigator.sendBeacon, {
    apply: function (target, thisArg, argumentsList) {
        argumentsList[0] = Utils.rewriteUrl(argumentsList[0]);
        return target.apply(thisArg, argumentsList);
    }
});

const oldAppendChild = Element.prototype.appendChild;

// @ts-ignore
Element.prototype.appendChild = function () {
    const element: Element = _.first(arguments);
    if (_.isFunction(element.getAttribute)) {
        const src = element.getAttribute('src');
        if (src)
            element.setAttribute('src', Utils.rewriteUrl(src));
    }
    return oldAppendChild.apply(this, arguments);
}

Debug.log('✅ FreedomRuntime Loaded');
DOM.runDomClock();
