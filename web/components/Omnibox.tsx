/// <reference types="user-agent-data-types" />

import $ from 'cash-dom';
import * as _ from 'lodash';
import {Button, Dropdown, Spinner} from "flowbite-react";
import normalizeUrl from "normalize-url";
import {useContext, useEffect, useRef, useState} from "react";
import {AiOutlineArrowRight} from "react-icons/ai";
import {Else, If, Then} from "react-if";
import store from "store2";
import {SharedCTX} from "../ctx";
import {BsArrowLeft, BsDot} from "react-icons/bs";
import {GrRefresh} from "react-icons/gr";
import {listenForWebViewMessages} from "../communication";
import Product from "../../shared/product";
import Suggestions from "../suggestions";
import to from "await-to-js";

// @ts-ignore
import isUrl from 'is-url';
import AutoComplete from "./AutoCompletion";
import Utils from "../../shared/utils";

export default function Omnibox() {
    const sharedCTX = useContext(SharedCTX);
    const omniboxRef = useRef<HTMLInputElement>();

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    const [activeSuggestionSelection, setActiveSuggestionSelection] = useState(0);

    useEffect(() => {
        const omnibox = omniboxRef.current;
        if (!omnibox)
            return;

        window.addEventListener('keydown', event => {
            if (event.key === "Escape")
                omniboxRef.current.blur();

            const controlKey = navigator.userAgentData.platform === 'macOS' ? event.metaKey : event.ctrlKey;
            if (controlKey && event.shiftKey && event.key === 'l') {
                event.preventDefault();
                omniboxRef.current.focus();
            }
        });

        listenForWebViewMessages(message => {
            if (message['type'] === 'omnibox.focus')
                omniboxRef.current.focus();
        });

        omnibox.value = store.get("omnibox.lastInput") || "";
        omnibox.focus();
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
        setSuggestions([]);
    };

    useEffect(() => {
        if (sharedCTX.url === omniboxRef.current.value || !sharedCTX.url) return;

        omniboxRef.current.value = sharedCTX.url;
    }, [sharedCTX.url]);

    useEffect(() => {
        if (!suggestionsVisible) return;

        const omnibox = omniboxRef.current;
        if (!omnibox) return;

        const suggestion = suggestions[activeSuggestionSelection];
        if (!suggestion) return;

        omnibox.value = suggestion;
    }, [activeSuggestionSelection]);

    return (
        <div className="flex flex-row justify-center items-center px-5 py-2 border-b-2 border-b-gray-300">
            <h1 className="select-none cursor-default font-bold mr-2">{Product.productName === "FreedomProxy" ? "FreedomProxy v2" : Product.productName}</h1>
            <input
                ref={omniboxRef}
                type="text"
                placeholder="Search or Enter URL..."
                className="flex-grow flex-1 rounded-lg rounded-l mr-2"
                onChange={event => {
                    setActiveSuggestionSelection(0);

                    const value = event.currentTarget.value;
                    store.set("omnibox.lastInput", value);
                    if (Utils.isEmptyOrSpaces(value))
                        setSuggestions([]);

                    if (value.length > 0 && !isUrl(value)) {
                        _.throttle(async () => {
                            if (value !== omniboxRef.current.value)
                                return;

                            const [err, newSuggestions] = await to(Suggestions.fetchSuggestions(value));
                            if (err)
                                return;

                            setSuggestions(newSuggestions);
                        }, 1000)();
                    }
                }}
                onKeyDown={event => {
                    if (event.key === "Enter")
                        handleOmniboxSubmit();

                    if (event.key === "ArrowDown")
                        setActiveSuggestionSelection(prevActiveSuggestionSelection => {
                            if (prevActiveSuggestionSelection === suggestions.length - 1)
                                return 0;
                            return prevActiveSuggestionSelection + 1;
                        });

                    if (event.key === "ArrowUp")
                        setActiveSuggestionSelection(prevActiveSuggestionSelection => {
                            if (prevActiveSuggestionSelection === 0)
                                return suggestions.length - 1;
                            return prevActiveSuggestionSelection - 1;
                        });
                }}
                onFocus={event => {
                    event.currentTarget.select();
                    setSuggestionsVisible(true);
                }}
                onBlur={() => {
                    // Have to delay this because otherwise the suggestion click event won't fire
                    _.delay(() => {
                        setSuggestionsVisible(false);
                    }, suggestionsVisible ? 100 : 0);
                }}
                disabled={sharedCTX.isLoading}
                inputMode='url'
            />
            <If condition={sharedCTX.isLoading}>
                <Then>
                    <Spinner/>
                </Then>
                <Else>
                    <Button className="cursor-default h-10" gradientDuoTone="purpleToBlue" outline title="Go"
                            disabled={!sharedCTX.connected} onClick={handleOmniboxSubmit}>
                        <AiOutlineArrowRight/>
                    </Button>
                </Else>
            </If>
            <div className="ml-5">
                <Dropdown inline label="🔨">
                    <Dropdown.Item onClick={() => {
                        const webview = $('#webview');
                        webview.attr('srcdoc', webview.attr('srcdoc'));
                    }}>
                        <GrRefresh className="ml-1" size={18}/><span className="ml-2">Refresh</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => {
                        if (sharedCTX.urls[sharedCTX.urls.length - 2]) {
                            sharedCTX.setUrl(sharedCTX.urls[sharedCTX.urls.length - 2]);
                            sharedCTX.removeTopUrl();
                        }
                    }}>
                        <BsArrowLeft className="ml-1" size={20}/><span className="ml-2">Back</span>
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <BsDot color={sharedCTX.connected ? 'green' : 'red'}
                               size={30}/> {sharedCTX.connected ? "Connected" : "Disconnected"}
                    </Dropdown.Item>
                </Dropdown>
            </div>
            <If condition={suggestionsVisible && !_.isEmpty(suggestions)}>
                <Then>
                    <AutoComplete
                        suggestions={suggestions}
                        activeSelection={activeSuggestionSelection}
                        onSelectionClick={index => {
                            if (!sharedCTX.connected)
                                return;

                            const currentSuggestion = suggestions[index];
                            sharedCTX.setUrl(isUrl(currentSuggestion) ? currentSuggestion : `https://www.google.com/search?q=${currentSuggestion}`)
                            setSuggestions([]);
                            omniboxRef.current.blur();
                        }}
                    />
                </Then>
            </If>
        </div>
    );
}
