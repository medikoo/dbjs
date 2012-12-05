'use strict';

var isError     = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	a.throws(function () { t(undefined); }, "Undefined");
	a(t(null), 0, "Null");
	a(t(false), 0, "Boolean");
	a.throws(function () { t({}); }, "Object");
	a.throws(function () { t('false'); }, "Unconvertable string");
	a(t('0'), 0, "Convertable string");
	a(t(123), 123, "Number");
	a(t(123.23), 123, "Float");
	a(t(123.63), 123, "Float #2");
	a(t(-123.23), -123, "Float: Negative");
	a(t(-123.64), -123, "Float: Negative #2");
	a(t(new Number(123)), 123, "Number object");
	return {
		"Is": function (a) {
			a(t.is(undefined), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(false), false, "Boolean");
			a(t.is({}), false, "Object");
			a(t.is('false'), false, "Unconrvertable string");
			a(t.is('0'), false, "Convertable string");
			a(t.is(123), true, "Integer");
			a(t.is(new Number(123)), false, "Number object");
			a(t.is(123.23), false, "Float");
			a(t.is(-123.23), false, "Float: Negative");
		},
		"Normalize": function (a) {
			a(t.normalize(undefined), null, "Undefined");
			a(t.normalize(null), 0, "Null");
			a(t.normalize(false), 0, "Boolean");
			a(t.normalize({}), null, "Object");
			a(t.normalize('false'), null, "Unconrvertable string");
			a(t.normalize('0'), 0, "Convertable string");
			a(t.normalize(123), 123, "Number");
			a(t.normalize(new Number(123)), 123, "Number object");
			a(t.normalize(123.23), 123, "Float");
			a(t.normalize(123.53), 123, "Float #2");
			a(t.normalize(-123.23), -123, "Float: Negative");
			a(t.normalize(-123.64), -123, "Float: Negative #2");
		},
		"Validate": function (a) {
			a(isError(t.validate()), true, "Undefined");
			a(t.validate(null), null, "Null");
			a(t.validate(false), null, "Boolean");
			a(isError(t.validate({})), true, "Object");
			a(isError(t.validate('false')), true, "Unconrvertable string");
			a(t.validate('0'), null, "Convertable string");
			a(t.validate(123), null, "Number");
			a(t.validate(new Number(123)), null, "Number object");
			a(t.validate(123.23), null, "Float");
			a(t.validate(-123.23), null, "Float: Negative");
		}
	};
};
