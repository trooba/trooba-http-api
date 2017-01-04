'use strict';

var Assert = require('assert');
var NodeUtils = require('util');
var Trooba = require('trooba');
var httpfy = require('..');
var Client = httpfy.Client;
var Request = httpfy.Request;

describe(__filename, function () {
    it('should inject api', function () {
        var client = Trooba.use(httpfy).build().create('client:default');
        Assert.ok(client.get);
        Assert.ok(client.post);
        Assert.ok(client.put);
        Assert.ok(client.delete);
        Assert.ok(client.patch);
        Assert.ok(client.request);
    });

    it('should allow extended client contructor', function (done) {
        function CustomClient(pipe, config) {
        }

        CustomClient.prototype.get = function get() {
            done();
        };

        var client = Trooba.use(httpfy, CustomClient).build().create('client:default');

        client.get({foo:'bar'});
    });

    it('should do request and expose runtime context', function (done) {

        function transport(pipe) {
            pipe.on('request', function (request) {
                Assert.deepEqual({
                    foo: 'bar',
                    headers: {}
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

        client.request({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should allow request override', function (done) {
        function transport(pipe) {
            pipe.on('request', function (request) {
                Assert.deepEqual({
                    foo: 'bar',
                    headers: {}
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

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

        function transport(pipe) {
            pipe.on('request', function (request) {
                Assert.deepEqual({
                    method: 'GET',
                    search: 'foo=bar',
                    headers: {}
                }, request);

                pipe.respond( {
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

        client.get({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do put', function (done) {
        function transport(pipe) {
            pipe.on('request', function (request) {
                Assert.deepEqual({
                    method: 'PUT',
                    body: {
                        foo: 'bar',
                    },
                    headers: {}
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

        client.put({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do patch', function (done) {
        function transport(pipe) {
            pipe.on('request', function (request) {
                Assert.deepEqual({
                    method: 'PATCH',
                    body: {
                        foo: 'bar',
                    },
                    headers: {}
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

        client.patch({
            foo: 'bar'
        }).end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do delete', function (done) {
        function transport(pipe) {
            pipe.on('request', function (request) {
                Assert.deepEqual({
                    method: 'DELETE',
                    path: '/path/to/resource',
                    headers: {}
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });

        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

        client.delete('/path/to/resource').end(function (err, res) {
            Assert.deepEqual({qaz: 'wer'}, res);
            done();
        });
    });

    it('should do post, headers, path, mixing', function (done) {
        function transport(pipe) {
            pipe.on('request', function (request) {
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
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });

        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

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
        function transport(pipe) {
            pipe.on('request', function (request) {
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
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });

        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

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
        function transport(pipe) {
            pipe.on('request', function (request) {
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
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

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

    it('should do get, query object, headers, path, mixing', function (done) {
        function transport(pipe) {
            pipe.on('request', function (request) {
                Assert.deepEqual({
                    method: 'GET',
                    path: '/path/at/one',
                    'o-cvb': 'azx',
                    'o-foo': 'asd',
                    headers: {
                        'h-bar': 'wsx',
                        'h-foo': 'qaz',
                        'h-krv': 'vbn',
                        'r-foo': 'bar'
                    }
                }, request);

                pipe.respond({
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create('client:default');

        client.request({
            headers: {
                'r-foo': 'bar'
            }
        })
        .set('h-foo', 'qaz')
        .set('h-bar', 'wsx')
        .path('/path/:to/:resource', {to:'at',resource:'one'})
        .options({
            method: 'GET',
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
