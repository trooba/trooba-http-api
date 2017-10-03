'use strict';

const Assert = require('assert');
const Queryparam = require('../lib/queryparam');

describe(__filename, () => {
    it('should stringify object', () => {
        Assert.equal('Number=1&Boolean=true&String=text&Array=1&Array=2&Array=true&Undefined=&Null=', Queryparam.stringify({
            Number: 1,
            Boolean: true,
            String: 'text',
            Array: [1, '2', true],
            Undefined: undefined,
            Null: null
        }));
    });

    it('should stringify object, custom', () => {
        Assert.equal('Number--1+Boolean--true+String--text+Array--1+Array--2+Array--true+Undefined--+Null--', Queryparam.stringify({
            Number: 1,
            Boolean: true,
            String: 'text',
            Array: [1, '2', true],
            Undefined: undefined,
            Null: null
        }, '+', '--'));
    });

    it('should stringify Number', () => {
        Assert.equal('foo=2', Queryparam.stringify(2, null, null, 'foo'));
    });

    it('should stringify null', () => {
        Assert.equal('', Queryparam.stringify(null));
    });

    it('should stringify undefined', () => {
        Assert.equal('', Queryparam.stringify(undefined));
    });
});
