/// <reference path="./typings/index.d.ts" />
import * as crypto from 'crypto';
import * as Promise from 'bluebird';

const regexp = /(.{8})(.{4})(.{4})(.{4})(.{12})/;
const VERSION = 0xF0000000;
const MILLISECONDS_SINCE_GREGORIAN_EPOCH = 12219292800000;
const MAX_ID_PER_MILLISECONDS = 655360000 ;

export class Generator {
    private counter = 0;
    private node: Buffer;
    private lastTimestamp: number;

    constructor(node?: Buffer) {
        if (node && node.length >= 6)
            this.node = node.slice(0,6);
        else
            this.node = crypto.pseudoRandomBytes(6);
        this.lastTimestamp = 0;
    }

    generateSync(): Identifier{
        let counter = this.counter++;
        let milliseconds = Date.now() + MILLISECONDS_SINCE_GREGORIAN_EPOCH;
        if (counter == MAX_ID_PER_MILLISECONDS) {
            if (milliseconds == this.lastTimestamp)
                throw new Error('Too many identifier generated');
            else
                this.counter = 0;
        } else {
            this.counter &= 0xFFFF;
        }
        this.lastTimestamp = milliseconds;
        return new Identifier(milliseconds, counter >>> 16, counter & 0xFFFF, this.node);
    }


    generate(): Promise<Identifier> {
        let generation = done => {

            let counter = this.counter ++;
            let milliseconds = Date.now() + MILLISECONDS_SINCE_GREGORIAN_EPOCH;
            if (counter == MAX_ID_PER_MILLISECONDS) {
                if (milliseconds == this.lastTimestamp && counter == MAX_ID_PER_MILLISECONDS)
                    return setImmediate(generation);
                else
                    this.counter = 0;
            }
            this.lastTimestamp = milliseconds;
            done(new Identifier(milliseconds, 0, this.counter++, this.node));
        };
        return new Promise<Identifier>(generation);
    }
}
//
// Timestamp(ms): 48bit
// Version  : 4bit
// Counter  : 28bit
// Node     :  48bit
export class Identifier {
    private value: Buffer;

    /**
     *
     * @param milliseconds
     * @param nanoseconds
     * @param counter
     * @param node
     */
    constructor (milliseconds: number, nanoseconds: number, counter: number, node: Buffer) {
        let timestamp = milliseconds & 0xFFFFFFFF;
        timestamp *= 10000;
        timestamp += nanoseconds;
        this.value = new Buffer(16);
        let timestampHigh = timestamp / 0x100000000;
        timestamp = (timestamp & 0xFFFFFFFF) >>> 0;
        this.value.writeUInt32BE(timestampHigh, 0); // High 32bit
        this.value.writeUInt16BE((timestamp >>> 12) & 0xFFFF, 4); //Middle 16bit
        let timestampLow = timestamp & 0xFFF;   //Low 12bit
        this.value.writeUInt32BE((VERSION + (timestampLow << 12) + (counter & 0xFFFF)), 6);
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