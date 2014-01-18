'use strict';

var isDbjsType = require('./is-dbjs-type');

module.exports = function (value) {
	if (isDbjsType(value)) return value;
	throw new TypeError(value + " is not dbjs type");
};
