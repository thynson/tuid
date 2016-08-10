/// <reference path="./typings/index.d.ts" />
import * as crypto from 'crypto';

export class Generator {
    private counter = 0;
    private node: Buffer;

    constructor(node?: Buffer) {
        if (node && node.length >= 6)
            this.node = node.slice(0,6);
        else
            this.node = crypto.pseudoRandomBytes(6);
    }

    generate(): Identifier{
        return new Identifier(Date.now(), this.counter++, this.node);
    }
}
const regexp = /(.{8})(.{4})(.{4})(.{4})(.{12})/;
const VERSION = 0xF0000000;
//
// Timestamp(ms): 48bit
// Version  : 4bit
// Counter  : 28bit
// Node     :  48bit
export class Identifier {
    private value: Buffer;

    constructor (timestamp: number, counter: number, node: Buffer) {
        this.value = new Buffer(16);
        this.value.writeUInt32BE((timestamp >> 12 >> 16) & 0xFFFFFFFF, 0);
        this.value.writeUInt16BE((timestamp >> 12) & 0xFFFF, 4);
        this.value.writeUInt32BE((VERSION + ((timestamp & 0xFF) << 16) + (counter & 0xFFFF)), 6);
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