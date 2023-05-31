export default class History {

    static interceptHistoryActions() {
        window.history.pushState = new Proxy(window.history.pushState, {
            apply: (...args) => {
                window.dispatchEvent(new Event('locationchange'));
                window.dispatchEvent(new Event('pushstate'));
                return void 0;
            }
        });
        window.history.replaceState = new Proxy(window.history.replaceState, {
            apply: (...args) => {
                window.dispatchEvent(new Event('locationchange'));
                window.dispatchEvent(new Event('replacestate'));
                return void 0;
            }
        });

        window.addEventListener('popstate', () => {
            window.dispatchEvent(new Event('locationchange'));
        });
    }

}
