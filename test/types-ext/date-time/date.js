'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	var date = new Date();
	a(t.is(t()), true, "Undefined");
	a(t.is(t(null)), true, "Null");
	date.setMinutes(12);
	a.not(t(date), date, "Date: Not UTC: same");
	a(t.is(t(date)), true, "Date: Not UTC");
	date = t.normalize(date);
	a(t(date), date, "Date: UTC");
	a.throws(function () { t(new Date('Invalid')); }, "Invalid date");
	a.throws(function () { t({}); }, "Other object");
	a(isDate(t(23423423)), true, "Number");
	return {
		"Is": function (a) {
			var date = new Date();
			a(t.is(), false, "Undefined");
			a(t.is(null), false, "Null");
			date.__proto__ = t.prototype;
			date.setUTCHours(14);
			a(t.is(date), false, "Date: Not UTC hours");
			date.setUTCHours(12);
			date.setUTCMinutes(12);
			a(t.is(date), false, "Date: Not UTC minutes");
			date.setUTCMinutes(0);
			date.setUTCSeconds(12);
			a(t.is(date), false, "Date: Not UTC seconds");
			date.setUTCSeconds(0);
			date.setUTCMilliseconds(12);
			a(t.is(date), false, "Date: Not UTC milliseconds");
			date.setUTCMilliseconds(0);
			a(t.is(date), true, "Date: UTC");
			a(t.is({}), false, "Other object");
			a(t.is(date.getTime()), false, "Number");
			a(t.is(new Date('Invalid')), false, "Invalid date");
		},
		"Normalize": function (a) {
			var date = new Date();
			a(t.normalize(), null, "Undefined");
			a(t.is(t.normalize(null)), true, "Null");
			a(t.is(t.normalize(date)), true, "Date: Not UTC");
			a.not(t.normalize(date), date, "Date: Not UTC: Same");
			date.setUTCHours(12);
			date.setUTCMinutes(0);
			date.setUTCSeconds(0);
			date.setUTCMilliseconds(0);
			a(t.normalize(date), date, "Date: UTC");
			a(t.normalize({}), null, "Other object");
			a(t.normalize(date.getTime()).getTime(), date.getTime(), "Number");
			a(t.normalize(new Date('Invalid')), null, "Invalid date");
		},
		"Validate": function (a) {
			var date = new Date();
			a(t.prototype.validateCreate(), null, "Undefined");
			a(t.prototype.validateCreate(null), null, "Null");
			a(t.prototype.validateCreate(date), null, "Date");
			a(isError(t.prototype.validateCreate(new Date('Invalid'))), true,
				"Invalid date");
			a(isError(t.prototype.validateCreate({})), true, "Other object");
			a(t.prototype.validateCreate(234234), null, "Number");
		}
	};
};
