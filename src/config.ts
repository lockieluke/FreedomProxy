import * as _ from 'lodash-es';
import {getUserAgent} from "universal-user-agent";

export default class Config {

    static readonly DEFAULT_USER_AGENT: string = process.env.DEFAULT_USER_AGENT ?? getUserAgent();
    static readonly DEFAULT_SEC_CH_UA: string = process.env.DEFAULT_SEC_CH_UA ?? "\"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"";
    static readonly DEFAULT_SEC_CH_UA_MOBILE: string = "?0";
    static readonly DEFAULT_SEC_CH_UA_PLATFORM: string = process.env.DEFAULT_SEC_CH_UA_PLATFORM ?? "\"Windows\"";
    static readonly DEFAULT_SEC_CH_UA_PLATFORM_VERSION: string = process.env.DEFAULT_SEC_CH_UA_PLATFORM_VERSION ?? "\"10.0.19043.0\"";
    static readonly DEFAULT_SEC_CH_UA_FULL_VERSION_LIST: string = process.env.DEFAULT_SEC_CH_UA_FULL_VERSION_LIST ?? "\"Chromium\";v=\"113.0.5672.126\", \"Not-A.Brand\";v=\"";


}
