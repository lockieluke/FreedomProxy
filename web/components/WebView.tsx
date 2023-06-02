/// <reference path="../types.d.ts" />

import {useContext, useEffect, useRef} from "react";
import {SharedCTX} from "../ctx";
import {listenForWebViewMessages} from "../communication";
import to from "await-to-js";

export default function WebView() {
    const sharedCTX = useContext(SharedCTX);
    const iframeRef = useRef<HTMLIFrameElement>();

    useEffect(() => {
        listenForWebViewMessages(message => {
            if (message.type === 'navigation.navigate')
                sharedCTX.setUrl(message['url']);
        });
    }, []);

    useEffect(() => {
        const url = sharedCTX.url;
        if (!url)
            return;

        sharedCTX.setIsLoading(true);
        console.log(`🌐 Loading URL: ${url}`);

        (async () => {
            const [err, data] = await to(window.helper.send('get-html', {
                url
            }));
            if (err) {
                console.error(`🌐 Failed to load URL: ${url}`);
                sharedCTX.setIsLoading(false);
                return;
            }

            sharedCTX.addUrl(url);
            iframeRef.current.srcdoc = data.html;
            console.log(`🌐 Successfully loaded URL: ${url}`);
            sharedCTX.setIsLoading(false);
        })();
    }, [sharedCTX.url]);

    return (<iframe ref={iframeRef} id="webview"
                    sandbox="allow-downloads allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
                    className="w-screen flex-1"></iframe>);
}
