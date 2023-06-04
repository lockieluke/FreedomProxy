/// <reference path="../shared/navigationApi.d.ts" />
/// <reference path="types.d.ts" />

import * as _ from 'lodash-es';
import Utils from "../shared/utils";
import isRelativeUrl from "is-relative-url";
import Debug from "./debug";

export default class Navigation {

    static interceptHistoryActions() {
        window.history.pushState = _.constant(void 0);
        window.history.replaceState = _.constant(void 0);
        window.history.go = _.constant(void 0);
    }

    static interceptNavigatorActions() {
        window.navigator.sendBeacon = new Proxy(window.navigator.sendBeacon, {
            apply: function (target, thisArg, argumentsList) {
                argumentsList[0] = Utils.rewriteUrl(argumentsList[0]);
                return target.apply(thisArg, argumentsList);
            }
        });
    }

    static interceptNavigationEvents() {
        if (_.isNil(window.navigation)) {
            console.error("🚨 Navigation API not supported");
            return;
        }

        navigation.addEventListener('navigate', event => {
            let url = event.destination.url.replace(/^file:\/\//, '');
            if (url.startsWith('about:'))
                return;

            let realUrl = Utils.undoRewriteUrl(url);
            if (isRelativeUrl(realUrl))
                realUrl = new URL(realUrl, window.targetUrl).toString();
            Debug.log(`🌐 Navigating to ${realUrl}`);
            event.preventDefault();

            parent.postMessage({
                type: 'navigation.navigate',
                url: realUrl
            });
        });
    }

}
