'use strict';

var isDate = require('es5-ext/lib/Date/is-date');

module.exports = require('../../types-base/date-time').create('Date', {
	is: function (value) {
		return isDate(value) && (value.getUTCHours() === 12) &&
			(value.getUTCMinutes() === 0) && (value.getUTCSeconds() === 0) &&
			(value.getUTCMilliseconds() === 0);
	},
	normalize: function (value) {
		if (this.is(value)) return value;
		if (!isDate(value)) value = new Date(value);
		return isNaN(value) ? null : new Date(Date.UTC(value.getFullYear(),
			value.getMonth(), value.getDate(), 12));
	}
}, {
	$create: function (value) {
		return this.ns.normalize((value == null) ? new Date() : new Date(value));
	}
});
