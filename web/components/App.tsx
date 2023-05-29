import to from "await-to-js";
import {useLayoutEffect, useState} from "react";
import * as _ from "lodash-es";
import Analytics from "../analytics";
import {SharedCTX} from "../ctx";
import Helper from "../helper";
import Omnibox from "./Omnibox";
import WebView from "./WebView";

export default function App() {
    const [connected, setConnected] = useState(false);
    const [url, setUrl] = useState<string>();
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

    return (<SharedCTX.Provider value={{
        connected,
        url,
        setUrl,
        isLoading,
        setIsLoading
    }}>
        <Omnibox/>
        <WebView/>
    </SharedCTX.Provider>);
}
