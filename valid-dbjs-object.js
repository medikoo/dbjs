'use strict';

var isDbjsObject = require('./is-dbjs-object');

module.exports = function (value) {
	if (isDbjsObject(value)) return value;
	throw new TypeError(value + " is not dbjs object");
};
