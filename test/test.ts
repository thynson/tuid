///<reference path="../typings/index.d.ts" />
import * as tuid from '../index';
import * as assert from 'assert';

describe('TuidGenerator', function(this: Mocha) {
    it('should should return id without node id', function(this: Mocha) {
        let generator = new tuid.Generator();
        let a = generator.generateSync().toString();
        let b = generator.generateSync().toString();
        let c = generator.generateSync().toString();
        if (!(a < b && b < c)){
            assert(false, `${a.toString()} ${b.toString()} ${c.toString()}`);
        }
    });
    it('should promise id without node id', function(this: Mocha) {
        let generator = new tuid.Generator();
        return generator.generate().then( (a: tuid.Identifier) => {
            generator.generate().then ( (b: tuid.Identifier)=> {
                generator.generate().then((c: tuid.Identifier)=>{
                    if (!(a.toString() < b.toString() && b.toString() < c.toString()))
                        assert(false, `${a.toString()} ${b.toString()} ${c.toString()}`);
                })
            })
        });
    });
    it('should should return id', function(this: Mocha) {
        let generator = new tuid.Generator(new Buffer(6));
        let a = generator.generateSync().toString();
        let b = generator.generateSync().toString();
        let c = generator.generateSync().toString();
        if (!(a < b && b < c))
            assert(false, `${a.toString()} ${b.toString()} ${c.toString()}`);
    });
    it('should promise id', function(this: Mocha) {
        let generator = new tuid.Generator(new Buffer(6));
        return generator.generate().then( a => {
            generator.generate().then ( b=> {
                generator.generate().then(c=>{
                    if (!(a < b && b < c))
                    assert(false, `${a.toString()} ${b.toString()} ${c.toString()}`);
                })
            })
        });
    });
    it('should generates id growth as time elapses', function (this: Mocha) {
        this.slow(30000).timeout(50000);

        let generator = new tuid.Generator(new Buffer(6));
        let ids = [];
        const COUNT = 0x100000;
        for (let i = 0; i < COUNT; i++) {
            ids.push(generator.generateSync());
        }
        for (let i = 1; i < COUNT; i++) {
            if (!(ids[i-1].toString() < ids[i].toString())) {
                assert(false, `${ids[i-1]} ${ids[i]}`);
            }
        }
    })
});
