'use strict';

var isFunction = require('es5-ext/lib/Function/is-function');

require('../../lib/types/base');

module.exports = function (t, a) {
	var fn = function () {};
	a(t(fn), fn, "Function");
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
			a(t.validate(fn), fn, "Function");
			a.throws(function () {
				t.validate();
			}, "Undefined");
			a.throws(function () {
				t.validate(false);
			}, "Boolean");
			a.throws(function () {
				t.validate({});
			}, "Other object");
			a.throws(function () {
				t.validate(23423);
			}, "Number");
		}
	};
};
