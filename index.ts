import * as crypto from 'crypto';

const regexp = /(.{8})(.{4})(.{4})(.{4})(.{12})/;
const VERSION = 0xF0000000;
const SECONDS_SINCE_GREGORIAN_EPOCH = 12219292800;
const MAX_ID_PER_MILLISECONDS = 655360000;

class GeneratorBusy extends Error {
    constructor() {
        super("Identifier generation is too frequently");
    }
}

export class Generator {
    private counter: number;
    private counterBegin: number;
    private node: Buffer;
    private lastTimestamp: number;

    constructor(node?: Buffer) {
        if (node && node.length >= 6)
            this.node = node.slice(0,6);
        else
            this.node = crypto.pseudoRandomBytes(6);
        this.lastTimestamp = 0;
        this.counter = 0;
        this.counterBegin = MAX_ID_PER_MILLISECONDS - 1;
    }

    generateSync(): Identifier{
        let milliseconds = Date.now();

        if (milliseconds == this.lastTimestamp) {
            if (this.counter == MAX_ID_PER_MILLISECONDS)
                throw new GeneratorBusy();
        } else {
            this.counter = 0;
        }
        this.lastTimestamp = milliseconds;

        let counter = this.counter++;

        let nanoseconds = milliseconds % 1000;
        let seconds = (milliseconds - nanoseconds) / 1000 + SECONDS_SINCE_GREGORIAN_EPOCH;
        nanoseconds *= 10000;
        nanoseconds += counter >>> 16;
        counter &= 0xFFFF;

        return new Identifier(seconds, nanoseconds, counter, this.node);
    }


    generate(): Promise<Identifier> {
        try {
            return Promise.resolve(this.generateSync())
        } catch (e) {
            if (e instanceof GeneratorBusy)
                return new Promise((done)=> {
                    setTimeout(done, 0);
                }).then(() => this.generate());
            else
                Promise.reject(e);
        }
    }
}

export class Identifier {
    private value: Buffer;

    constructor (seconds: number, chns: number, counter: number, node: Buffer) {

        let v = seconds % 0x10000000;
        let u = (seconds - v) / 0x10000000;
        let w = chns;
        let n = (v * 10000000 + w) % 0x10000000;
        let m = (v * 10000000 + w - n) / 0x10000000;

        let high = m + u*10000000;
        let low = n;
        this.value = new Buffer(16);
        this.value.writeUInt32BE(high, 0); // High 32bit
        this.value.writeUInt16BE(low >>> 12, 4); //Middle 16bit
        this.value.writeUInt32BE((VERSION | ((low & 0xFFF)<< 16) | counter) >>> 0, 6);
        if (node == null || node.length < 6)
            node = crypto.pseudoRandomBytes(6);
        node.copy(this.value, 10, 0, 6);
    }

    toBuffer(): Buffer {
        return this.value;
    }

    toString(): string{
        return this.value.toString('hex').replace(regexp, '$1-$2-$3-$4-$5');
    }
}