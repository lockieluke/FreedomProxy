import to from "await-to-js";
import {useEffect, useLayoutEffect, useState} from "react";
import * as _ from "lodash-es";
import Analytics from "../analytics";
import {SharedCTX} from "../ctx";
import Helper from "../helper";
import Omnibox from "./Omnibox";
import WebView from "./WebView";
import {TidyURL} from "tidy-url";
import {Slide, toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const [connected, setConnected] = useState(false);
    const [url, _setUrl] = useState<string>();
    const [urls, setUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useLayoutEffect(() => {
        (async () => {
            const [err, ipInfo] = await to(Analytics.getClientIPInfo());
            if (err)
                console.error(`❌ Failed to retrieve client IP: ${err}`);
            if (!_.isNil(ipInfo?.ipAddress))
                console.log(`✅ Retrieved client IP: ${ipInfo.ipAddress}`);

            try {
                window.helper = new Helper(ipInfo,connected => {
                    setConnected(connected);
                });
            } catch (err) {
                console.log(`❌ Failed to initialize helper: ${err}`);
            }
        })();
    }, []);

    useEffect(() => {
        _.defer(() => {
            toast("FreedomProxy is only for educational purposes.", {
                hideProgressBar: true,
                draggable: false,
                closeOnClick: false,
                closeButton: false,
                position: 'bottom-right',
                transition: Slide,
                icon: '🔒'
            });
        });
    }, []);

    return (<SharedCTX.Provider value={{
        connected,
        url,
        setUrl: url => {
            _setUrl(TidyURL.clean(url).url);
        },
        urls,
        addUrl: url => {
            setUrls(prevUrls => [...prevUrls, url]);
        },
        removeTopUrl: () => {
            setUrls(prevUrls => prevUrls.slice(0, prevUrls.length - 1));
        },
        isLoading,
        setIsLoading
    }}>
        <Omnibox/>
        <WebView/>
        <ToastContainer />
    </SharedCTX.Provider>);
}
