/// <reference types="user-agent-data-types" />

import {Button, Spinner} from "flowbite-react";
import normalizeUrl from "normalize-url";
import * as _ from "lodash-es";
import {useContext, useEffect, useRef} from "react";
import {AiOutlineArrowRight} from "react-icons/ai";
import {Else, If, Then} from "react-if";
import store from "store2";
import {SharedCTX} from "../ctx";
import isUrl = require("is-url");

export default function Omnibox() {
    const sharedCTX = useContext(SharedCTX);
    const omniboxRef = useRef<HTMLInputElement>();

    useEffect(() => {
        window.addEventListener('keydown', event => {
            if (event.key === "Escape")
                omniboxRef.current.blur();

            const controlKey = navigator.userAgentData.platform === 'macOS' ? event.metaKey : event.ctrlKey;
            if (controlKey && event.shiftKey && event.key === 'l') {
                event.preventDefault();
                omniboxRef.current.focus();
            }
        });

        window.addEventListener('message', event => {
            const data = _.attempt(eventData => JSON.parse(eventData), JSON.stringify(event.data));
            if (_.isError(data))
                return;

            if (data['type'] === 'omnibox.focus')
                omniboxRef.current.focus();
        });

        omniboxRef.current.value = store.get("omnibox.lastInput") || "";
    }, []);

    const handleOmniboxSubmit = () => {
        const currentInput = omniboxRef.current.value;
        if (!sharedCTX.connected) return;

        if (!isUrl(currentInput)) {
            const url = normalizeUrl(currentInput.replace(/^(?!www\.)/, "www."), {
                stripWWW: false,
                forceHttps: true
            });
            store.set("omnibox.lastInput", url);
            omniboxRef.current.value = url;

            sharedCTX.setUrl(url);
        } else {
            sharedCTX.setUrl(currentInput);
        }
        omniboxRef.current.blur();
    };

    return (
        <div className="flex flex-row justify-center items-center px-5 py-2 border-b-2 border-b-gray-300">
            <h1 className="select-none cursor-default font-bold mr-2">FreedomProxy <span>v2</span></h1>
            <input ref={omniboxRef} type="text" placeholder="Search or Enter URL..."
                   className="flex-grow flex-1 rounded-lg rounded-l mr-2" onChange={event => {
                store.set("omnibox.lastInput", event.currentTarget.value);
            }} onKeyDown={event => {
                if (event.key === "Enter")
                    handleOmniboxSubmit();
            }} onFocus={event => {
                event.currentTarget.select();
            }} disabled={sharedCTX.isLoading} inputMode='url'/>
            <If condition={sharedCTX.isLoading}>
                <Then>
                    <Spinner/>
                </Then>
                <Else>
                    <Button className="cursor-default" gradientDuoTone="purpleToBlue" outline title="Go"
                            disabled={!sharedCTX.connected} onClick={handleOmniboxSubmit}>
                        <AiOutlineArrowRight />
                    </Button>
                </Else>
            </If>
        </div>
    );
}
