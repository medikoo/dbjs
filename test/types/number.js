'use strict';

var isNumberNaN = require('es5-ext/lib/Number/is-nan');

module.exports = function (t, a) {
	a(isNumberNaN(t(undefined)), true, "Undefined");
	a(t(null), 0, "Null");
	a(t(false), 0, "Boolean");
	a(isNumberNaN(t({})), true, "Object");
	a(isNumberNaN(t('false')), true, "Unconrvertable string");
	a(t('0'), 0, "Convertable string");
	a(t(123), 123, "Number");
	a(t(new Number(123)), 123, "Number object");
	return {
		"Normalize": function (a) {
			a(isNumberNaN(t.normalize(undefined)), true, "Undefined");
			a(t.normalize(null), 0, "Null");
			a(t.normalize(false), 0, "Boolean");
			a(isNumberNaN(t.normalize({})), true, "Object");
			a(isNumberNaN(t.normalize('false')), true, "Unconrvertable string");
			a(t.normalize('0'), 0, "Convertable string");
			a(t.normalize(123), 123, "Number");
			a(t.normalize(new Number(123)), 123, "Number object");
		},
		"Validate": function (a) {
			a(isNumberNaN(t.validate(undefined)), true, "Undefined");
			a(t.validate(null), 0, "Null");
			a(t.validate(false), 0, "Boolean");
			a(isNumberNaN(t.validate({})), true, "Object");
			a(isNumberNaN(t.validate('false')), true, "Unconrvertable string");
			a(t.validate('0'), 0, "Convertable string");
			a(t.validate(123), 123, "Number");
			a(t.validate(new Number(123)), 123, "Number object");
		}
	};
};
