import {isBrowser} from "browser-or-node";

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_MOCK_NAME: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const __COMMIT_HASH__: string;

export default class Product {

    // Change productName to something else for spoofing
    // @ts-ignore
    static productName = (isBrowser ? import.meta.env.VITE_APP_MOCK_NAME : process.env.VITE_APP_MOCK_NAME) ?? "FreedomProxy";

    static commitHash = isBrowser ? __COMMIT_HASH__ : process.env.VITE_COMMIT_HASH;

}
