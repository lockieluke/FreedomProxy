import BareClient, {BareFetchInit} from "@tomphttp/bare-client";
import $ from 'cash-dom';
import {createRoot} from "react-dom/client";
import Analytics from "./analytics";
import App from "./components/Root";
import Helper from "./helper";

const createBareClient = require('@tomphttp/bare-client');

declare global {
    interface Window {
        helper: Helper;
    }
}

const serverUrl = 'http://localhost:8080';
$(async () => {
    let bareClient: BareClient
    try {
        bareClient = await createBareClient(`${serverUrl}/bare/`);

        // @ts-ignore
        window.fetch = (input, init) => {
            try {
                return bareClient.fetch(input, init as BareFetchInit);
            } catch (err) {
                console.error("❌ Failed to fetch", err);
                throw err;
            }
        }
    } catch (err) {
        console.error("❌ Failed to connect to server", err);
        return;
    }

    const root = createRoot($('#app').get(0));
    root.render(App());
    console.log("✅ Initialised React UI");
});
