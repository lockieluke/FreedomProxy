import {useContext, useEffect, useRef} from "react";
import * as _ from 'lodash-es';
import {SharedCTX} from "../ctx";

export default function WebView() {
    const sharedCTX = useContext(SharedCTX);
    const iframeRef = useRef<HTMLIFrameElement>();

    useEffect(() => {
        const url = sharedCTX.url;
        if (_.isNil(url)) return;
        sharedCTX.setIsLoading(true);
        console.log(`🌐 Loading URL: ${url}`);

        (async () => {
            const data = await window.helper.send('get-html', {
                url
            });

            iframeRef.current.srcdoc = data.html;
            console.log(`🌐 Successfully loaded URL: ${url}`);
            sharedCTX.setIsLoading(false);
        })();
    }, [sharedCTX.url]);

    return (<iframe ref={iframeRef} sandbox="allow-downloads allow-forms allow-modals allow-popups allow-scripts allow-same-origin" className="w-screen flex-1">
    </iframe>);
}
