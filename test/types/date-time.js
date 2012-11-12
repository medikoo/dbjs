'use strict';

var isDate = require('es5-ext/lib/Date/is-date');

module.exports = function (t, a) {
	var date = new Date();
	a.throws(function () { t(); }, "Undefined");
	a(t(date), date, "Date");
	a.throws(function () { t(false); }, "Boolean");
	a.throws(function () { t({}); }, "Other object");
	a.throws(function () { t(date.getTime()); }, "Number");
	return {
		"Normalize": function (a) {
			var date = new Date();
			a(isDate(t.normalize()), true, "Undefined");
			a(isDate(t.normalize(null)), true, "Null");
			a(t.normalize(date), date, "Date");
			a(isDate(t.normalize(false)), true, "Boolean");
			a(isDate(t.normalize({})), true, "Other object");
			a(t.normalize(date.getTime()).getTime(), date.getTime(), "Number");
		},
		"Validate": function (a) {
			var date = new Date();
			a.throws(function () { t.validate(); }, "Undefined");
			a(t.validate(date), date, "Date");
			a.throws(function () { t.validate(false); }, "Boolean");
			a.throws(function () { t.validate({}); }, "Other object");
			a.throws(function () { t.validate(date.getTime()); }, "Number");
		}
	};
};
