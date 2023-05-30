import Debug from "./debug";
import DOM from "./dom";
import Fetching from "./fetching";
import History from "./history";
import Navigator from "./navigator";

Debug.log('✅ FreedomRuntime Loaded');
performance.mark('start');
Fetching.fixFetching();
Navigator.interceptNavigatorActions();
History.interceptHistoryActions();
DOM.interceptDomActions();
DOM.runDomClock();
performance.mark('end');
const startupPerf = performance.measure('FreedomRuntime', 'start', 'end');
Debug.log(`✅ FreedomRuntime Ready in ${startupPerf.duration.toFixed(2)}ms`);
