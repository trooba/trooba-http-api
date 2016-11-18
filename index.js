'use strict';

var Queryparam = require('./lib/queryparam');
var template = require('underscore').template;

var colonTemplateSettings = {
    interpolate: /:(.+?)\b/g
};

module.exports = function httpfy(transport, Ctor) {
    // allow extending client API
    Ctor = Ctor || Client;

    transport.api = function api(pipe) {
        return new Ctor(pipe);
    };

    return transport;
};

function Client(pipe) {
    this.pipe = pipe;
}

module.exports.Client = Client;

var proto = Client.prototype;

/**
 * General request
 * @param options
 */
proto.request = function request(request, Ctor) {
    request.headers = request.headers || {};
    Ctor = Ctor || Request;
    return new Ctor(request, this.pipe);
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

function Request(request, pipe) {
    this.request = request;
    this.pipe = pipe;
}

module.exports.Request = Request;

Request.prototype = {

    options: function options(opts) {
        Utils.mixin(this.request.headers, opts.headers);
        Utils.mixin(opts, this.request);
        return this;
    },

    path: function path(pathValue, pathParams) {
        if (!pathParams) {
            this.request.path = pathValue;
        } else {
            var createPath = template(pathValue, colonTemplateSettings);
            this.request.path = createPath(pathParams);
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
        return this.pipe(function ctx(requestContext, next) {
            requestContext.request = request;
            requestContext.request.headers = requestContext.request.headers || {};

            // stringify some headers
            requestContext.request.headers =
                Utils.stringifyHeaders(requestContext.request.headers);

            next(function onResponseContext(responseContext) {
                callback(responseContext.error, responseContext.response);
            });
        });
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
