# trooba-http-api

[![Build Status](https://travis-ci.org/trooba/trooba-http-api.svg?branch=master)](https://travis-ci.org/trooba/trooba-http-api) [![NPM](https://img.shields.io/npm/v/trooba-http-api.svg)](https://www.npmjs.com/package/trooba-http-api)
[![Downloads](https://img.shields.io/npm/dm/trooba-http-api.svg)](http://npm-stat.com/charts.html?package=trooba-http-api)
[![Known Vulnerabilities](https://snyk.io/test/github/trooba/trooba/badge.svg)](https://snyk.io/test/github/trooba/trooba-http-api)

Provides a generic transport API to http/ajax/xhr trooba transports.

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
    pipe.set('client:http', httpfy);
};
```

### Attach to any pipe

```js
var Trooba = require('trooba');
var httpfy = require('trooba-http-api');

var client = Trooba
.use(function someHandler() {})
.use(function someHandler() {})
.use(function someHandler() {})
.use(httpfy)
.build('client:default'); // since it injects default at ''client:default''

client.delete('path/to/resource').end(console.log);
```
