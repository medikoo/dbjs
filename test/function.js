'use strict';

var isFunction = require('es5-ext/lib/Function/is-function');

module.exports = function (t) {
	return {
		"": function (a) {
			var fn = function () {};
			a(t(undefined), null, "Undefined");
			a(t(null), null, "Null");
			a(t(fn), fn, "Function");
			a.throws(function () {
				t(false);
			}, "Boolean");
			a.throws(function () {
				t({});
			}, "Other object");
			a.throws(function () {
				t(23423);
			}, "Number");
		},
		"Normalize": function (a) {
			var fn = function (value) { return 'foo' + value; }, fn2;
			a(t.normalize(undefined), undefined, "Undefined");
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
			a(t(undefined), null, "Undefined");
			a(t(null), null, "Null");
			a(t(fn), fn, "Function");
			a.throws(function () {
				t(false);
			}, "Boolean");
			a.throws(function () {
				t({});
			}, "Other object");
			a.throws(function () {
				t(23423);
			}, "Number");
		}
	};
};
