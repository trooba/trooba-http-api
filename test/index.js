'use strict';

var Assert = require('assert');
var NodeUtils = require('util');
var Trooba = require('trooba');
var httpfy = require('..');
var Request = httpfy.Request;

describe(__filename, function () {
    it('should instrument transport object', function () {
        var factory = httpfy({});
        Assert.ok(factory.api);
        var client = factory.api();
        Assert.ok(client.get);
        Assert.ok(client.post);
        Assert.ok(client.put);
        Assert.ok(client.delete);
        Assert.ok(client.patch);
        Assert.ok(client.request);
    });

    it('should allow extended client contructor', function (done) {

        function CustomClient(requestContext, responseContext) {
            Assert.equal('quest', requestContext.req);
            Assert.equal('ponse', responseContext.res);
            done();
        }
        var factory = httpfy({}, CustomClient);
        var client = factory.api({
            req: 'quest'
        }, {
            res: 'ponse'
        });

        client.get();
    });

    it('should do request', function (done) {

        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    foo: 'bar',
                    headers: {}
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.request({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should allow request override', function (done) {
        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    foo: 'bar',
                    headers: {}
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        function ExtRequest() {
            Request.apply(this, arguments);
        }
        NodeUtils.inherits(ExtRequest, Request);
        ExtRequest.prototype.end = function (callback) {
            Request.prototype.end.call(this, function (err, res) {
                res.ext = true;
                callback(err, res);
            });
        };

        client.request({
            foo: 'bar'
        }, ExtRequest).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer', ext: true}, res);
            done();
        });
    });

    it('should do get', function (done) {

        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    method: 'GET',
                    search: 'foo=bar',
                    headers: {}
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.get({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do put', function (done) {
        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    method: 'PUT',
                    body: {
                        foo: 'bar',
                    },
                    headers: {}
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.put({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do patch', function (done) {
        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    method: 'PATCH',
                    body: {
                        foo: 'bar',
                    },
                    headers: {}
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.patch({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do delete', function (done) {
        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    method: 'DELETE',
                    path: '/path/to/resource',
                    headers: {}
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.delete('/path/to/resource').end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do post, headers, path, mixing', function (done) {
        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    method: 'POST',
                    path: '/path/at/one',
                    body: {
                        'b-foo': 'azs'
                    },
                    'o-cvb': 'azx',
                    'o-foo': 'asd',
                    headers: {
                        'h-bar': 'wsx',
                        'h-foo': 'qaz',
                        'h-krv': 'vbn'
                    }
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.post({
            'b-foo': 'azs'
        })
        .set('h-foo', 'qaz')
        .set('h-bar', 'wsx')
        .path('/path/:to/:resource', {to:'at',resource:'one'})
        .options({
            'o-foo': 'asd',
            'o-cvb': 'azx',
            headers: {
                'h-krv': 'vbn'
            }
        })
        .end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do get, query object, headers, path, mixing', function (done) {
        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    method: 'GET',
                    path: '/path/at/one',
                    search: 'b-foo=azs',
                    'o-cvb': 'azx',
                    'o-foo': 'asd',
                    headers: {
                        'h-bar': 'wsx',
                        'h-foo': 'qaz',
                        'h-krv': 'vbn'
                    }
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.get({
            'b-foo': 'azs'
        })
        .set('h-foo', 'qaz')
        .set('h-bar', 'wsx')
        .path('/path/:to/:resource', {to:'at',resource:'one'})
        .options({
            'o-foo': 'asd',
            'o-cvb': 'azx',
            headers: {
                'h-krv': 'vbn'
            }
        })
        .end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do get, query object, headers, path, mixing', function (done) {
        function factory() {
            return httpfy(function (requestContext, responseContext) {
                Assert.deepEqual({
                    method: 'GET',
                    path: '/path/at/one',
                    search: 'b-foo=azs',
                    'o-cvb': 'azx',
                    'o-foo': 'asd',
                    headers: {
                        'h-bar': 'wsx',
                        'h-foo': 'qaz',
                        'h-krv': 'vbn'
                    }
                }, requestContext.request);

                responseContext.next(null, {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.transport(factory).create();

        client.get('b-foo=azs')
        .set('h-foo', 'qaz')
        .set('h-bar', 'wsx')
        .path('/path/:to/:resource', {to:'at',resource:'one'})
        .options({
            'o-foo': 'asd',
            'o-cvb': 'azx',
            headers: {
                'h-krv': 'vbn'
            }
        })
        .end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });
});
