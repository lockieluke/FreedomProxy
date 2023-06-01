import * as _ from "lodash-es";

export function listenForWebViewMessages(cb: (message: Partial<{ type: string }>) => void) {
    window.addEventListener('message', event => {
        const data = _.attempt(eventData => JSON.parse(eventData), JSON.stringify(event.data));
        if (_.isError(data) || !data || !data.type)
            return;

        cb(data);
    });
}
