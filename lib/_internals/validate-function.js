'use strict';

var isFunction = require('es5-ext/lib/Function/is-function');

module.exports = function (value) {
	if (isFunction(value)) return null;
	return new TypeError(value + " is not a function");
};
