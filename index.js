'use strict';

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
    Utils.mixin(options, {
        headers: {},
        mvheaders: {}
    }, this.requestContext.options);

    Ctor = Ctor || Request;
    return new Ctor(this.requestContext);
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
    qsParams && (options.qs = qsParams);
    return this.request(options);
};

/**
 * POST request
 * @param postParams
 *  {
 *      body: 'post request body'
 *      qs: {query parameter if any}
 *      path: 'path to target'
 *  }
 * @callback is optional
 */
proto.post = function post(postParams) {
    postParams.method = 'POST';
    return this.request(postParams);
};

/**
 * PUT request
 * @param putParams
 *  {
 *      body: 'put request body'
 *      qs: {query parameter if any}
 *      path: 'path to target'
 *  }
 * @callback is optional
 */
proto.put = function put(putParams) {
    putParams.method = 'PUT';
    return this.request(putParams);
};

/**
 * PATCH request
 * @param patchParams
 *  {
 *      body: 'put request body'
 *      qs: {query parameter if any}
 *      path: 'path to target'
 *  }
 * @callback is optional
 */
proto.patch = function patch(patchParams) {
  patchParams.method = 'PATCH';
  return this.request(patchParams);
};

/**
 * DETELE request
 * @param path: 'path to target'
 * @callback is optional
 */
proto.delete = function _delete(path) {
    return this.request({
        path: path,
        method: 'DELETE'
    });
};

function Request(requestContext) {
    this.requestContext = requestContext;
}

module.exports.Request = Request;

Request.prototype = {

    options: function options(opts) {
        Utils.mixin(opts, this.requestContext.options);
        return this;
    },

    path: function path(pathValue, pathParams) {
        if (!pathParams) {
            this.requestContext.options.path = pathValue;
        } else {
            var createPath = template(pathValue, colonTemplateSettings);
            this.requestContext.options.path = createPath(pathParams);
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
        this.requestContext.options.headers[key] = value;
        return this;
    },

    end: function end(callback) {
        var ctx = this.requestContext;
        // stringify some headers
        ctx.options.headers =
            Utils.stringifyHeaders(ctx.options.headers);

        ctx.exec(callback);
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
    }
};
