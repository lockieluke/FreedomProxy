import to from "await-to-js";
import * as _ from "lodash-es";
import Analytics from "../analytics";
import {SharedCTX} from "../ctx";
import Helper from "../helper";
import Omnibox from "./Omnibox";
import WebView from "./WebView";
import {TidyURL} from "tidy-url";
import {Slide, toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {Modal} from "flowbite-react";
import Product from "../../shared/product";
import {useEffect, useLayoutEffect, useState} from "preact/hooks";
import {If, Then} from "react-if";

export default function App() {
    const [isFocused, setIsFocused] = useState(true);
    const [connected, setConnected] = useState(false);
    const [url, _setUrl] = useState<string>();
    const [urls, setUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAboutDialog, setShowAboutDialog] = useState(false);

    useLayoutEffect(() => {
        (async () => {
            const [err, ipInfo] = await to(Analytics.getClientIPInfo());
            if (err)
                console.error(`❌ Failed to retrieve client IP: ${err}`);
            if (!_.isNil(ipInfo?.ipAddress))
                console.log(`✅ Retrieved client IP: ${ipInfo.ipAddress}`);

            try {
                window.helper = new Helper(ipInfo, connected => {
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

        const onFocus = () => setIsFocused(true);
        const onBlur = () => {
            if (!document.hidden && !document.hasFocus())
                setIsFocused(false);
        };

        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);

        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    const defaultClassName = 'flex flex-col items-center justify-center h-screen';

    // @ts-ignore
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
        showAboutDialog,
        setShowAboutDialog,
        isLoading,
        setIsLoading
    }}>
        <Modal dismissible show={showAboutDialog} onClose={() => setShowAboutDialog(false)}>
            <Modal.Header>About {Product.productName}</Modal.Header>
            <Modal.Body>
                <p>Commit Hash: {Product.commitHash}</p>
                <a className="text-blue-600 hover:underline"
                   href="https://github.com/lockieluke/FreedomProxy">GitHub</a>
            </Modal.Body>
        </Modal>
        <Omnibox/>
        <WebView/>
        <If condition={!isFocused}>
            <Then>
                <div class={'absolute bg-white inset-0 z-50'}>
                    <div class={defaultClassName}>
                        <p className="text-2xl font-bold">FreedomProxy</p>
                        <p className="text-xl">is sleeping...</p>
                    </div>
                </div>
            </Then>
        </If>
        <ToastContainer />
    </SharedCTX.Provider>);
}
