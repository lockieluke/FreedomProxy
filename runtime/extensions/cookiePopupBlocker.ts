import {Cash} from "cash-dom";
import * as _ from 'lodash-es';
import Utils from "../../shared/utils";
import Extension from "./index";

export default class CookiePopupBlocker extends Extension {

    private blockList: string[] = [];

    constructor() {
        super({
            name: "Cookie Popup Blocker",
            version: "0.0.1",
            requireElements: '*'
        });
    }

    onInit(): void {
        super.onInit();
        (async () => {
            const response = await Utils.postMessageAndAwaitResponse({
                type: "cookiePopupBlockerGetBlockList"
            });

            this.blockList = _.split(response['blockList'], '\n') ?? [];
        })();
    }

    onDomNodeAdded($elm: Cash) {
        super.onDomNodeAdded($elm);

        // TODO: Apply block list
    }

}
