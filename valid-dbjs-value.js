'use strict';

var isDbjsValue = require('./is-dbjs-value');

module.exports = function (value) {
	if (isDbjsValue(value)) return value;
	throw new TypeError(value + " is not dbjs value");
};
