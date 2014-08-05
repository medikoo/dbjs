'use strict';

var isDbjsError = require('./is-dbjs-error');

module.exports = function (x) {
	if (!isDbjsError(x)) throw new TypeError(x + " is not a DbjsError object");
	return x;
};
