'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a(isError(t()), true, "Undefined");
	a(isError(t(null)), true, "Null");
	a(t(function () {}), null, "Function");
	a(isError(t(/raz/)), true, "Other object");
};
