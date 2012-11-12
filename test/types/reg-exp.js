'use strict';

var isRegExp = require('es5-ext/lib/RegExp/is-reg-exp');

module.exports = function (t, a) {
	var re = /raz/;
	a.throws(function () { t(); }, "Undefined");
	a(t(re), re, "RegExp");
	a.throws(function () { t(false); }, "Boolean");
	a.throws(function () { t({}); }, "Other object");
	a.throws(function () { t('/sdfsdf/'); }, "String");
	a.throws(function () { t(function () {}); }, "Function");
	return {
		"Normalize": function (a) {
			var re = /raz/;
			a(isRegExp(t.normalize(undefined)), true, "Undefined");
			a(isRegExp(t.normalize(null)), true, "Null");
			a(t.normalize(re), re, "Date");
			a(isRegExp(t.normalize(false)), true, "Boolean");
			a(isRegExp(t.normalize('raz')), true, "String");
			a(t.normalize('\\'), null, "Invalid regExp string");
		},
		"Validate": function (a) {
			var re = /raz/;
			a.throws(function () { t.validate(); }, "Undefined");
			a(t.validate(re), re, "RegExp");
			a.throws(function () { t.validate(false); }, "Boolean");
			a.throws(function () { t.validate({}); }, "Other object");
			a.throws(function () { t.validate('/sdfsdf/'); }, "String");
			a.throws(function () { t.validate(function () {}); }, "Function");
		}
	};
};
