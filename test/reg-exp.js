'use strict';

var isRegExp = require('es5-ext/lib/RegExp/is-reg-exp');

module.exports = function (t) {
	return {
		"": function (a) {
			var re = /raz/;
			a(t(undefined), null, "Undefined");
			a(t(null), null, "Null");
			a(t(re), re, "RegExp");
			a.throws(function () {
				t(false);
			}, "Boolean");
			a.throws(function () {
				t({});
			}, "Other object");
			a.throws(function () {
				t('/sdfsdf/');
			}, "String");
			a.throws(function () {
				t(function () {});
			}, "Function");
		},
		"Normalize": function (a) {
			var re = /raz/;
			a(t.normalize(undefined), undefined, "Undefined");
			a(t.normalize(null), null, "Null");
			a(t.normalize(re), re, "Date");
			a(isRegExp(t.normalize(false)), true, "Boolean");
			a(isRegExp(t.normalize('raz')), true, "String");
			a(t.normalize('\\'), null, "Invalid regExp string");
		},
		"Validate": function (a) {
			var re = /raz/;
			a(t.validate(undefined), null, "Undefined");
			a(t.validate(null), null, "Null");
			a(t.validate(re), re, "RegExp");
			a.throws(function () {
				t.validate(false);
			}, "Boolean");
			a.throws(function () {
				t.validate({});
			}, "Other object");
			a.throws(function () {
				t.validate('/sdfsdf/');
			}, "String");
			a.throws(function () {
				t.validate(function () {});
			}, "Function");
		}
	};
};
