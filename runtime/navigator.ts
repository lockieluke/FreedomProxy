import Utils from "../shared/utils";

export default class Navigator {

    static interceptNavigatorActions() {
        window.navigator.sendBeacon = new Proxy(window.navigator.sendBeacon, {
            apply: function (target, thisArg, argumentsList) {
                argumentsList[0] = Utils.rewriteUrl(argumentsList[0]);
                return target.apply(thisArg, argumentsList);
            }
        });
    }

}
