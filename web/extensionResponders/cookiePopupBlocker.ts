import * as _ from 'lodash-es';
import ExtensionResponder from "./index";

export default class CookiePopupBlockerResponder extends ExtensionResponder {

    constructor() {
        super({
            name: "Cookie Popup Blocker",
            version: "0.0.1"
        });
    }

    onMessage(message: Partial<{ type: string }>, sendResponse: (message: any) => void): void {
        (async () => {
            if (message.type === 'cookiePopupBlockerGetBlockList') {
                const blockListResponse = await window.helper.send(_.kebabCase(message.type));
                sendResponse({
                    type: 'cookiePopupBlockerGetBlockListRes',
                    ...blockListResponse
                });
            }
        })();
    }

}
