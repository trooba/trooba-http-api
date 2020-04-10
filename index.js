'use strict';

var Queryparam = require('./lib/queryparam');
var template = require('lodash.template');

var colonTemplateSettings = {
    interpolate: /:(.+?)\b/g
};

module.exports = function httpfy(pipe, Ctor) {
    // allow extending client API
    Ctor = Ctor || Client;

    pipe.set('client:default', function api(pipe) {
        return new Ctor(pipe);
    });
};

function Client(pipe, config) {
    this.pipe = pipe;
    this.config = config;
    this.ctx = {};
}

module.exports.Client = Client;

var proto = Client.prototype;

/*
 * Sets a new context
 */
proto.context = function (ctx) {
    var newClient = new Client(this.pipe, this.config);
    newClient.ctx = Object.assign({}, ctx);
    return newClient;
};

/**
 * General request
 * @param options
 */
proto.request = function request(request, Ctor) {
    request.headers = request.headers || {};
    Ctor = Ctor || Request;
    return new Ctor(request, this.pipe, this.ctx);
};

/**
 * GET request
 * @param params is query string in json or string format
 */
proto.get = function get(qsParams) {
    var options = {
        method: 'GET'
    };
    if (qsParams && typeof qsParams === 'object') {
        qsParams = Queryparam.stringify(qsParams);
    }
    qsParams && (options.search = qsParams);
    return this.request(options);
};

/**
 * POST request
 * @param 'request body'
 */
proto.post = function post(postParams) {
    return this.request({
        method: 'POST',
        body: postParams
    });
};

/**
 * PUT request
 * @param 'request body'
 */
proto.put = function put(putParams) {
    return this.request({
        method: 'PUT',
        body: putParams
    });
};

/**
 * PATCH request
 * @param 'request body'
 */
proto.patch = function patch(patchParams) {
    return this.request({
        method: 'PATCH',
        body: patchParams
    });
};

/**
 * DETELE request
 * @param path: 'path to target'
 */
proto.delete = function _delete(path) {
    return this.request({
        path: path,
        method: 'DELETE'
    });
};

function Request(request, pipe, context) {
    this.request = request;
    this.pipe = pipe;
    this.context = context;
}

module.exports.Request = Request;

Request.prototype = {

    options: function options(opts) {
        if (opts) {
            opts.headers = opts.headers || {};
            Utils.mixin(this.request.headers, opts.headers);
            Utils.mixin(opts, this.request);
        }
        return this;
    },

    path: function path(pathValue, pathParams) {
        if (!pathParams) {
            this.request.path = pathValue;
        } else {
            this.request.path = template(pathValue, colonTemplateSettings)(pathParams);
        }
        return this;
    },

    /*
     * Sets the request headers
     * The method have two signatures
     *  - set(kvpName) - to setup multi-value headers
     *  - set(name, value) - for simaple headers
    */
    set: function set(key, value) {
        this.request.headers[key] = value;
        return this;
    },

    end: function end(callback) {
        var request = this.request;
        request = request;
        request.headers = request.headers || {};

        // stringify some headers
        request.headers =
            Utils.stringifyHeaders(request.headers);

        return this.pipe.create(Object.assign({}, this.context)).request(request, callback);
    }
};

var Utils = {
    // This is isomorphic version of mixin
    mixin: function mixin(src1, src2, etc, dest) {
        var args = [].slice.call(arguments);
        dest = args.pop();
        if (dest) {
            args.forEach(function forEach(src) {
                if (src) {
                    Object.keys(src).forEach(function forEach(key) {
                        dest[key] = src[key];
                    });
                }
            });
        }
        return dest;
    },

    stringifyHeaders: function stringifyHeaders(headers) {
        return Object.keys(headers).reduce(function reduce(memo, key) {
            var val = memo[key];
            if (val && typeof val === 'object' && val.set) {
                // assume it is multi-value headers
                memo[key] = val.toString();
            }
            return memo;
        }, headers);
    },

    stringifyQuery: Queryparam.stringify
};

module.exports.Utils = Utils;
