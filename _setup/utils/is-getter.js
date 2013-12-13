'use strict';

var isFunction = require('es5-ext/function/is-function')
  , isGetter   = require('./is-function-getter');

module.exports = function (value) {
	return (isFunction(value) && isGetter(value));
};
