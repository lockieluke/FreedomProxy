import * as _ from 'lodash-es';
import isRelativeUrl from "is-relative-url";
import validDataUrl from 'valid-data-url';

export default class Utils {

    static rewriteUrl(url: string) {
        if (url.startsWith(window['serverUrl']) || validDataUrl(url))
            return url;
        return `${window['serverUrl']}/mask?url=${isRelativeUrl(url) ? _.toString(new URL(url, window['targetUrl'])) : url}`;
    }

}
