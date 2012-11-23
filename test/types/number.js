'use strict';

var isError     = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	var ns = t.create('numtest2', { min: -100, max: 100 });
	a.throws(function () { t(undefined); }, "Undefined");
	a(t(null), 0, "Null");
	a(t(false), 0, "Boolean");
	a.throws(function () { t({}); }, "Object");
	a.throws(function () { t('false'); }, "Unconvertable string");
	a(t('0'), 0, "Convertable string");
	a(t(123), 123, "Number");
	a(t(new Number(123)), 123, "Number object");
	a(ns(60), 60, "Custom");
	a.throws(function () { ns(-123); }, "Custom: Below min");
	a.throws(function () { ns(123); }, "Custom: Above max");
	return {
		"Is": function (a) {
			a(t.is(undefined), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(false), false, "Boolean");
			a(t.is({}), false, "Object");
			a(t.is('false'), false, "Unconrvertable string");
			a(t.is('0'), false, "Convertable string");
			a(t.is(123), true, "Number");
			a(t.is(new Number(123)), false, "Number object");
			a(ns.is(60), true, "Custom");
			a(ns.is(-123), false, "Custom: Below min");
			a(ns.is(123), false, "Custom: Above max");
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
			a(ns.normalize(60), 60, "Custom");
			a(ns.normalize(-123), null, "Custom: Below min");
			a(ns.normalize(123), null, "Custom: Above max");
		},
		"Validate": function (a) {
			a(isError(t.validate(undefined)), true, "Undefined");
			a(t.validate(null), undefined, "Null");
			a(t.validate(false), undefined, "Boolean");
			a(isError(t.validate({})), true, "Object");
			a(isError(t.validate('false')), true, "Unconrvertable string");
			a(t.validate('0'), undefined, "Convertable string");
			a(t.validate(123), undefined, "Number");
			a(t.validate(new Number(123)), undefined, "Number object");
			a(ns.validate(60), undefined, "Custom");
			a(isError(ns.validate(-123)), true, "Custom: Below min");
			a(isError(ns.validate(123)), true, "Custom: Above max");
		}
	};
};
