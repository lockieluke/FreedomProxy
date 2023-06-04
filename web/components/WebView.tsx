/// <reference path="../types.d.ts" />

import {useContext, useEffect, useRef, useState} from "react";
import {SharedCTX} from "../ctx";
import {listenForWebViewMessages} from "../communication";
import to from "await-to-js";
import {Else, If, Then} from "react-if";
import Product from "../../shared/product";

// @ts-ignore
import Icon from '@assets/wave.png';
import LearnMore from "./LearnMore";
import ChromeDino from "./ChromeDino";

export default function WebView() {
    const sharedCTX = useContext(SharedCTX);
    const iframeRef = useRef<HTMLIFrameElement>();
    const [showLearnMore, setShowLearnMore] = useState(false);

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

    return (<If condition={sharedCTX.url}>
        <Then>
            <iframe ref={iframeRef} id="webview"
                    sandbox="allow-downloads allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
                    className="w-screen flex-1"></iframe>
        </Then>
        <Else>
            <div className="flex-1 flex flex-col justify-center items-center select-none">
                <If condition={showLearnMore}>
                    <Then>
                        <LearnMore onBack={() => setShowLearnMore(false)} />
                    </Then>
                    <Else>
                        <If condition={sharedCTX.connected}>
                            <Then>
                                <img src={Icon} alt="FreedomProxy icon" draggable={false} className="w-32 h-32 my-5" />
                                <div className="text-2xl font-bold">Welcome to {Product.productName}</div>
                                <div className="text-xl">Enter a URL or search Google to continue</div>
                                <a href="javascript:void(0)" onClick={() => setShowLearnMore(true)} draggable={false} className="my-2 text-blue-600 hover:underline">Learn more</a>
                            </Then>
                            <Else>
                                <ChromeDino />
                                <h1 className="text-xl font-bold">Could not connect to helper</h1>
                                <p className="w-2/4 my-2 text-center">Please try again later and reload without cache</p>
                            </Else>
                        </If>
                    </Else>
                </If>
            </div>
        </Else>
    </If>);
}
