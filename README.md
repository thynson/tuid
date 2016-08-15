# Timed Unique Identifier

[![Build Status](https://travis-ci.org/thynson/tuid.svg?branch=master)](https://travis-ci.org/thynson/tuid)
[![Coverage Status](https://coveralls.io/repos/github/thynson/tuid/badge.svg)](https://coveralls.io/github/thynson/tuid)

## Introduction
This is a variation of UUID version 1 defined in RFC4412. 

The design goals of this variation is to make identifier growth as time
elapses, which is index-friendly for database.
## Install
```bash
npm install tuid
```
## Usage

```javascript
var tuid = requier('tuid');
var generator = tuid.Generator(); // create a generator with random node id
var id = generator.generateSync();
console.log(id.toString()); // prints: 1e660627-c30c-f010-0000-7affa0ae7874
console.log(id.toBuffer().toString('hex')); // prints: 1e660627c30cf01000007affa0ae7874
```

### API
#### Generator
* `constructor([node: Buffer])`
  Constructor, take an optional buffer parameter, the buffer should be 
  at least 6 byte. Typically it should be the MAC address of one network 
  interface of the host machine. If the node buffer is not presented,
  random 6 bytes will be fetched via `crypto.getPseudoRandomBytes`.
* `generateSync(): Identifier` 
  Generate a Identifier synchronously. Note if identifier is generated 
  too frequently, exceeding 65536000ops/1ms, an exception will be throw
  because due to conflict.
*  `generate(): Promise<Identifier>`
  Generate a Identifier. The returned promise is resolved immediately, 
  unless the identifier generation is exceeding 65536000ops/1ms, in such
  situation, the promise will defer to a suitable time. 
  
## Implementation Detail

The identifier layout: 

  <table>
    <thead>
      <td>Timestamp High 32bit</td>
      <td>Timestamp Middle 16bit</td>
      <td>Version (0xf) and Timestamp Low 12bit</td>
      <td>Clock Sequence</td>
      <td>Node 48bit</td>
    </thead>
    <tbody>
      <tr>
        <td>1e660627</td>
        <td>c30c</td>
        <td><strong>f</strong>010</td>
        <td>0000</td>
        <td>bdd077ed01e5</td>
      </tr>
    </tbody>
  </table>
  
As show in above:

1. the version changed to `f` to indicates that this is 
not a standard UUID implementation as currently only v1, v3, v4 and v5 is
defined. 

2. Timestamp are encoded into a identifier from higher bit 
to lower bit in network byte order, to ensure the identifier growth when
treated as a byte string as time elapses. The definition of timestamp is
same with the ones defined in UUID v1, which is count of 100-nanoseconds 
since Gregorian Epoch (Oct. 15th, 1587). For system lacks of high 
resolution timer, such as Javascript, the lower bit of timestamp can be 
emulated by clock sequence. 

3. Clock sequence takes two bytes(16bits) and no reserved bits.

4. Node field remains same with UUID v1.

## License
```
Copyright (C) 2016 LAN Xingcan
All right reserved
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

