'use strict';

var isDate    = require('es5-ext/date/is-date')
  , isError   = require('es5-ext/error/is-error')
  , serialize = require('../../lib/utils/serialize');

module.exports = function (t, a) {
	var date = new Date();
	a(isDate(t()), true, "Undefined");
	a(isDate(t()), true, "Null");
	a(t(date).getTime(), date.getTime(), "Date");
	a.throws(function () { t(new Date('Invalid')); }, "Invalid date");
	a.throws(function () { t({}); }, "Other object");
	a(isDate(t(23423423)), true, "Number");
	return {
		"Is": function (a) {
			var date = new Date();
			a(t.is(), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(date), false, "Date");
			t.normalize(date);
			a(t.is(date), true, "Date: Normalized");
			a(t.is({}), false, "Other object");
			a(t.is(date.getTime()), false, "Number");
			a(t.is(new Date('Invalid')), false, "Invalid date");
		},
		"Normalize": function (a) {
			var date = new Date();
			a(t.normalize(), null, "Undefined");
			a(isDate(t.normalize(null)), true, "Null");
			a(t.normalize(date), date, "Date");
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
		},
		"Serialize": function (a) {
			var date = new Date();
			a(t._serialize_(date), serialize(date));
		}
	};
};
