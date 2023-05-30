import {Packr} from "msgpackr";

export default class Msgpack {

    static packr = new Packr();

    static encodeToString(data: any): string {
        return this.packr.pack(data).toString('base64');
    }

    static decodeFromString(data: string): any {
        return this.packr.unpack(Buffer.from(data, 'base64'));
    }

}
