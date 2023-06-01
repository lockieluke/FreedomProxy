import $ from "cash-dom";
import * as async from 'modern-async';
import Debug from "./debug";
import DOM from "./dom";
import CookiePopupBlocker from "./extensions/cookiePopupBlocker";
import Fetching from "./fetching";
import Navigation from "./navigation";

Debug.log('✅ FreedomRuntime Loaded');
performance.mark('start');

Fetching.fixFetching();
Navigation.interceptNavigatorActions();
Navigation.interceptNavigationEvents();
Navigation.interceptHistoryActions();

DOM.passDomEventsToUI();
DOM.interceptDomActions();
DOM.runDomClock();

$(async () => {
    performance.mark('extensionsStart');
    const extensions = [new CookiePopupBlocker()];
    await async.forEach(extensions, extension => extension.onInit());
    window['extensions'] = extensions;
    performance.mark('extensionsEnd');

    const extensionLoadPerf = performance.measure('FreedomExtensions', 'extensionsStart', 'extensionsEnd');
    Debug.log(`✅ Extensions loaded in ${extensionLoadPerf.duration.toFixed(2)}ms`);
});

performance.mark('end');
const startupPerf = performance.measure('FreedomRuntime', 'start', 'end');
Debug.log(`✅ FreedomRuntime Ready in ${startupPerf.duration.toFixed(2)}ms`);
