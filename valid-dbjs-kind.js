'use strict';

var isDbjsKind = require('./is-dbjs-kind');

module.exports = function (value) {
	if (isDbjsKind(value)) return value;
	throw new TypeError(value + " is not dbjs object");
};
