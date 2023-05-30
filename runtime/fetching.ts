import Utils from "../shared/utils";

export default class Fetching {

    static fixFetching() {
        XMLHttpRequest.prototype.open = new Proxy(XMLHttpRequest.prototype.open, {
            apply: function (target, thisArg, argumentsList) {
                if (argumentsList[1])
                    argumentsList[1] = Utils.rewriteUrl(argumentsList[1]);
                return target.apply(thisArg, argumentsList);
            }
        });
    }

}
