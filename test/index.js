'use strict';

var Assert = require('assert');
var NodeUtils = require('util');
var Trooba = require('trooba');
var Async = require('async');
var httpfy = require('..');
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

                Assert.equal('wsx', pipe.context.qaz);
                Assert.equal('zxc', pipe.context.asd);

                pipe.respond({
                    qaz: 'wer'
                });
            });
        }

        var client = Trooba.use(transport).use(httpfy).build().create({
            qaz: 'wsx'
        }, 'client:default');

        var request = client.request({
            foo: 'bar'
        });

        request.context.asd = 'zxc';

        request.end(function (err, res) {
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

    it('should have no conflict between two calls of the same instance', next => {
        function transport(pipe) {
            pipe.on('request', function (request) {
                pipe.respond(`Hello ${pipe.context.who}`);
            });
        }

        var client = Trooba
        .use(pipe => {
            pipe.on('request', (request, next) => {
                // change context
                pipe.context.who = pipe.context.who || request.body;
                next();
            });
        })
        .use(transport)
        .use(httpfy)
        .build()
        .create('client:default');

        client
        .request({
            body: 'John'
        })
        .end((err, response) => {
            Assert.equal('Hello John', response);

            client
            .request({
                body: 'Bob'
            })
            .end((err, response) => {
                Assert.equal('Hello Bob', response);

                next();
            });
        });

    });

    it('should use context without conflict between two calls of the same instance', next => {
        function transport(pipe) {
            pipe.on('request', function (request) {
                pipe.respond(`Hello ${pipe.context.who}`);
            });
        }

        var client = Trooba
        .use(pipe => {
            pipe.on('request', (request, next) => {
                // change context
                pipe.context.who = pipe.context.who || request.body;
                next();
            });
        })
        .use(transport)
        .use(httpfy)
        .build()
        .create({
            who: 'Bob'
        }, 'client:default');

        const newClientJohn = client.context({
            who: 'John'
        });

        const newClientJack = client.context({
            who: 'Jack'
        });

        Assert.ok(newClientJohn, client);
        Assert.equal('John', newClientJohn.ctx.who);
        Assert.equal('Jack', newClientJack.ctx.who);
        Assert.deepEqual({}, client.ctx);

        newClientJohn.get({}).end((err, res) => {
            Assert.equal('Hello John', res);

            newClientJack.get({}).end((err, res) => {
                Assert.equal('Hello Jack', res);

                client.get({}).end((err, res) => {
                    Assert.equal('Hello Bob', res);
                    next();
                });
            });
        });
    });

    it('should have no conflict between parallel calls of the same instance', next => {
        function transport(pipe) {
            pipe.on('request', function (request) {
                setTimeout(() => {
                    pipe.respond(`${pipe.context.who}`);
                }, parseInt(Math.random() * 100, 10));
            });
        }

        var client = Trooba
        .use(pipe => {
            pipe.on('request', (request, next) => {
                // change context
                pipe.context.who = pipe.context.who || request.body;
                next();
            });
        })
        .use(transport)
        .use(httpfy)
        .build()
        .create('client:default');

        Async.times(100, (index, next) => {
            client
            .request({
                body: 'name' + index
            })
            .end((err, response) => {
                Assert.equal('name' + index, response);

                next();
            });
        }, next);
    });

});
