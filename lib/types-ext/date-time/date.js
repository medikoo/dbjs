'use strict';

module.exports = require('../../types-base/date-time').create('Date', {
	is: function (value) {
		return (value && value.getUTCHours && (value.getUTCHours() === 12) &&
			(value.getUTCMinutes() === 0) && (value.getUTCSeconds() === 0) &&
			(value.getUTCMilliseconds() === 0)) || false;
	},
	normalize: function (value) {
		if (this.is(value)) return value;
		value = this.coerce(value);
		if (value == null) return null;
		return new Date(Date.UTC(value.getFullYear(), value.getMonth(),
			value.getDate(), 12));
	}
}, {
	$create: function (value) {
		return this.ns.normalize((value == null) ? new Date() : new Date(value));
	}
});
