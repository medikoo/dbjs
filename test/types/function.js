'use strict';

var isError    = require('es5-ext/lib/Error/is-error')
  , isFunction = require('es5-ext/lib/Function/is-function');

module.exports = function (t, a) {
	var fn = function () {};
	a(t(fn), fn, "Function");
	a(typeof t(String(fn)), 'function', "Function string");
	a.throws(function () {
		t();
	}, "Undefined");
	a.throws(function () {
		t(false);
	}, "Boolean");
	a.throws(function () {
		t({});
	}, "Other object");
	a.throws(function () {
		t(23423);
	}, "Number");
	return {
		"Is": function (a) {
			var fn = function () {};
			a(t.is(fn), true, "Function");
			a(t.is(String(fn())), false, "Function string");
			a(t.is(), false, "Undefined");
			a(t.is(false), false, "Boolean");
			a(t.is({}), false, "Other object");
			a(t.is(23432), false, "String");
		},
		"Normalize": function (a) {
			var fn = function (value) { return 'foo' + value; }, fn2;
			a(t.normalize(undefined), null, "Undefined");
			a(t.normalize(null), null, "Null");
			a(t.normalize(fn), fn, "Date");
			a(t.normalize(false), null, "Boolean");
			a(t.normalize({}), null, "Other object");
			fn2 = t.normalize(fn.toString());
			a(isFunction(fn2), true, "Function string");
			a(fn2('bar'), 'foobar', "Function string: Code");
		},
		"Validate": function (a) {
			var fn = function () {};
			a(t.validate(fn), undefined, "Function");
			a(t.validate(String(fn)), undefined, "Function string");
			a(isError(t.validate()), true, "Undefined");
			a(isError(t.validate(false)), true, "Boolean");
			a(isError(t.validate({})), true, "Other object");
			a(isError(t.validate(23432)), true, "String");
		}
	};
};
