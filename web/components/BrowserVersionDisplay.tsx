import {useEffect, useState} from "react";
import {IResult, UAParser} from "ua-parser-js";
import * as _ from "lodash-es";
import {If, Then} from "react-if";

export default function BrowserVersionDisplay() {
    const [uaParsed, setUaParsed] = useState<IResult>();
    const [supportsNavigationAPI, setSupportsNavigationAPI] = useState(false);

    useEffect(() => {
        const parsed = UAParser();

        setUaParsed(parsed);
        setSupportsNavigationAPI(!_.isNil(window.navigation));
    }, []);

    return (<>
        <If condition={!_.isNil(uaParsed)}>
            <Then>
                <p className="text-sm font-light text-gray-500">
                    {_.get(uaParsed, 'browser.name')} {_.get(uaParsed, 'browser.major')} on {_.get(uaParsed, 'os.name')} {_.get(uaParsed, 'os.version')},
                    Navigation API <span className="italic">{supportsNavigationAPI ? "Supported" : "Unsupported"}</span>
                </p>
            </Then>
        </If>
    </>)
}
