'use strict';

var Queryparam = require('./lib/queryparam');
var template = require('underscore').template;

var colonTemplateSettings = {
    interpolate: /:(.+?)\b/g
};

module.exports = function httpfy(transport, Ctor) {
    // allow extending client API
    Ctor = Ctor || Client;

    transport.api = function api(requestContext, responseContext) {
        return new Ctor(requestContext, responseContext);
    };

    return transport;
};

function Client(requestContext, responseContext) {
    this.requestContext = requestContext;
    this.responseContext = responseContext;
}

module.exports.Client = Client;

var proto = Client.prototype;

/**
 * General request
 * @param options
 * @callback is optional
 */
proto.request = function request(options, Ctor) {
    this.requestContext.request = this.requestContext.request || {};
    Utils.mixin(options, {
        headers: {}
    }, this.requestContext.request);

    Ctor = Ctor || Request;
    return new Ctor(this.requestContext, this.responseContext);
};

/**
 * GET request
 * @param params is query string in json or string format
 * @callback is optional
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

function Request(requestContext, responseContext) {
    this.requestContext = requestContext;
    this.responseContext = responseContext;
}

module.exports.Request = Request;

Request.prototype = {

    options: function options(opts) {
        Utils.mixin(this.requestContext.request.headers, opts.headers);
        Utils.mixin(opts, this.requestContext.request);
        return this;
    },

    path: function path(pathValue, pathParams) {
        if (!pathParams) {
            this.requestContext.request.path = pathValue;
        } else {
            var createPath = template(pathValue, colonTemplateSettings);
            this.requestContext.request.path = createPath(pathParams);
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
        this.requestContext.request.headers[key] = value;
        return this;
    },

    end: function end(callback) {
        var ctx = this.requestContext;
        // stringify some headers
        ctx.request.headers =
            Utils.stringifyHeaders(ctx.request.headers);

        this.requestContext.next(callback);
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
