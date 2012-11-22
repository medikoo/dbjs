'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , d      = require('es5-ext/lib/Object/descriptor')
  , root   = require('./root')

  , DateTime;

module.exports = DateTime = root.create('DateTime', function Self(value) {
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

Object.defineProperties(DateTime, {
	coerce: d('c', DateTime._normalize),
	__serialize: d('c', function (value) { return '4' + Number(value); })
});
