# trooba-http-api

[![codecov](https://codecov.io/gh/trooba/trooba-http-api/branch/master/graph/badge.svg)](https://codecov.io/gh/trooba/trooba-http-api)
[![Build Status](https://travis-ci.org/trooba/trooba-http-api.svg?branch=master)](https://travis-ci.org/trooba/trooba-http-api) [![NPM](https://img.shields.io/npm/v/trooba-http-api.svg)](https://www.npmjs.com/package/trooba-http-api)
[![Downloads](https://img.shields.io/npm/dm/trooba-http-api.svg)](http://npm-stat.com/charts.html?package=trooba-http-api)
[![Known Vulnerabilities](https://snyk.io/test/github/trooba/trooba-http-api/badge.svg)](https://snyk.io/test/github/trooba/trooba-http-api)

Provides a generic transport API to http/ajax/xhr trooba transports.

## Get Involved

- **Contributing**: Pull requests are welcome!
    - Read [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) and check out our [bite-sized](https://github.com/trooba/trooba-http-api/issues?q=is%3Aissue+is%3Aopen+label%3Adifficulty%3Abite-sized) and [help-wanted](https://github.com/trooba/trooba-http-api/issues?q=is%3Aissue+is%3Aopen+label%3Astatus%3Ahelp-wanted) issues
    - Submit github issues for any feature enhancements, bugs or documentation problems
- **Support**: Join our [gitter chat](https://gitter.im/trooba) to ask questions to get support from the maintainers and other Trooba developers
    - Questions/comments can also be posted as [github issues](https://github.com/trooba/trooba-http-api/issues)

## Install

```
npm install trooba-http-api --save
```

## Usage

### Export via transport
```js
var Wreck = require('wreck');
var _ = require('lodash');

var httpfy = require('trooba-http-api');

module.exports = function transport(pipe, config) {
    pipe.on('request', function (request) {
        request = _.merge(request || {}, config);
        Wreck.request(request, function onResponse(err, response) {
            if (err) {
                pipe.throw(err);
                return;
            }
            pipe.respond(response);
        });
    });

    // inject api
    pipe.set('client:default', httpfy);
};
```

### Attach to any pipe

```js
var Trooba = require('trooba');

var client = new Trooba()
.use(function someHandler() {})
.use(function someHandler() {})
.use(function someHandler() {})
.use('trooba-http-api')
.build()
.create('client:default'); // since it injects default at ''client:default''

client.delete('path/to/resource').end(console.log);
```
