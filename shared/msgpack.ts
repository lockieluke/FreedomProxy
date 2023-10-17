import {Packr} from "msgpackr";

export default class Msgpack {

    static packr = new Packr();

    static encode(data: any): Buffer {
        return this.packr.pack(data);
    }

    static decode(data: Buffer): any {
        return this.packr.unpack(data);
    }

}
