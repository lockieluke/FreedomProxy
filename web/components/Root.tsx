/// <reference path="../../shared/navigationApi.d.ts" />

import App from "./App";
import {Else, If, Then} from "react-if";
import * as _ from 'lodash-es';

import Utils from "../../shared/utils";
import Product from "../../shared/product";
import ChromeDino from "./ChromeDino";
import BrowserVersionDisplay from "./BrowserVersionDisplay";

export default function Root() {
    return (
        <If condition={Utils.isChromium && !_.isNil(window.navigation)}>
            <Then>
                <App />
            </Then>
            <Else>
                <div className="flex flex-col h-full items-center justify-center select-none">
                    <ChromeDino />
                    <h1 className="text-xl font-bold">Your browser is not supported</h1>
                    <p className="w-2/4 my-2 text-center">{Product.productName} relies on experimental web technologies that are not implemented in {Utils.isChromeOS ? "older versions of Chrome, please update Chrome OS" : "some browser engines, please use Chrome, Edge(Chromium), Opera or any other up-to-date Chromium-based browsers"}</p>
                    <BrowserVersionDisplay />
                    <p className="text-[10px] font-light italic text-gray-500">Commit {Product.commitHash}</p>
                </div>
            </Else>
        </If>
    )
}
