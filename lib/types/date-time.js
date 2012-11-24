'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , base   = require('./base')

  , DateTime;

module.exports = DateTime = base.create('DateTime', function Self(value) {
	if (value == null) return new Date();
	if (!isDate(value)) value = new Date(value);
	if (isNaN(value)) throw new TypeError(value + " is invalid date value");
	return value;
}, {
	is: function (value) { return isDate(value) && !isNaN(value); },
	validate: function (value) {
		if ((value != null) && isNaN(isDate(value) ? value : new Date(value))) {
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
