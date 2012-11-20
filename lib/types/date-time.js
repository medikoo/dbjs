'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , root     = require('./root');

module.exports = root.create('DateTime', function Self(value) {
	if (isDate(value)) return value;
	if (isNaN(value = new Date(value))) {
		throw new TypeError(value + " is invalid date value");
	}
	return value;
}, {
	is: function (value) { return isDate(value) && !isNaN(value); },
	validate: function (value) {
		if (!isDate(value) && isNaN(new Date(value))) {
			return new TypeError(value + " is invalid date value");
		}
	},
	normalize: function (value) {
		if (!isDate(value)) value = new Date(value);
		return isNaN(value) ? null : value;
	}
});
