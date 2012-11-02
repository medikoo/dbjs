'use strict';

var isDate = require('es5-ext/lib/Date/is-date');

module.exports = function (t) {
	return {
		"": function (a) {
			var date = new Date();
			a(t(undefined), null, "Undefined");
			a(t(null), null, "Null");
			a(t(date), date, "Date");
			a.throws(function () {
				t(false);
			}, "Boolean");
			a.throws(function () {
				t({});
			}, "Other object");
			a.throws(function () {
				t(date.getTime());
			}, "Number");
		},
		"Normalize": function (a) {
			var date = new Date();
			a(t.normalize(undefined), undefined, "Undefined");
			a(t.normalize(null), null, "Null");
			a(t.normalize(date), date, "Date");
			a(isDate(t.normalize(false)), true, "Boolean");
			a(isDate(t.normalize({})), true, "Other object");
			a(t.normalize(date.getTime()).getTime(), date.getTime(), "Number");
		},
		"Validate": function (a) {
			var date = new Date();
			a(t.validate(undefined), null, "Undefined");
			a(t.validate(null), null, "Null");
			a(t.validate(date), date, "Date");
			a.throws(function () {
				t.validate(false);
			}, "Boolean");
			a.throws(function () {
				t.validate({});
			}, "Other object");
			a.throws(function () {
				t.validate(date.getTime());
			}, "Number");
		}
	};
};
