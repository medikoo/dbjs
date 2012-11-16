'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	var date = new Date();
	a.throws(function () { t(); }, "Undefined");
	a(t(date), date, "Date");
	a.throws(function () { t({}); }, "Other object");
	a(isDate(t(23423423)), true, "Number");
	return {
		"Is": function (a) {
			var date = new Date();
			a(t.is(), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(date), true, "Date");
			a(t.is({}), false, "Other object");
			a(t.is(date.getTime()), false, "Number");
		},
		"Normalize": function (a) {
			var date = new Date();
			a(isDate(t.normalize()), true, "Undefined");
			a(isDate(t.normalize(null)), true, "Null");
			a(t.normalize(date), date, "Date");
			a(isDate(t.normalize({})), true, "Other object");
			a(t.normalize(date.getTime()).getTime(), date.getTime(), "Number");
		},
		"Validate": function (a) {
			var date = new Date();
			a(isError(t.validate()), true, "Undefined");
			a(t.validate(date), undefined, "Date");
			a(isError(t.validate()), true, "Other object");
			a(t.validate(234234), undefined, "Number");
		}
	};
};
