'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , root   = require('./root')

  , DateTime;

module.exports = DateTime = root.create('DateTime', function Self(value) {
	if (isDate(value)) return value;
	if (value == null) return new Date();
	if (isNaN(value = new Date(value))) {
		throw new TypeError(value + " is invalid date value");
	}
	return value;
}, {
	is: function (value) { return isDate(value) && !isNaN(value); },
	validate: function (value) {
		if ((value != null) && !isDate(value) && isNaN(new Date(value))) {
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

extend(DateTime, Date);
extend(DateTime.prototype, Date.prototype);
