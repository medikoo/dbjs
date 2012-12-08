'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , Base   = require('./base')

  , DateTime;

module.exports = DateTime = Base.$create('DateTime');
DateTime._construct.$setValue(function (value) {
	if (value == null) return new Date();
	if (!isDate(value)) value = new Date(value);
	if (isNaN(value)) throw new TypeError(value + " is invalid date value");
	return value;
});
DateTime._$construct.$setValue(function (value) {
	return (value == null) ? new Date() : new Date(value);
});
DateTime._is.$setValue(function (value) {
	return isDate(value) && !isNaN(value);
});
DateTime._validate.$setValue(function (value) {
	if ((value != null) && isNaN(isDate(value) ? value : new Date(value))) {
		return new TypeError(value + " is invalid date value");
	}
	return null;
});
DateTime._normalize.$setValue(function (value) {
	if (!isDate(value)) value = new Date(value);
	return isNaN(value) ? null : value;
});

Object.defineProperties(DateTime, {
	coerce: d('c', DateTime._normalize),
	_serialize_: d('c', function (value) { return '4' + Number(value); })
});

extend(DateTime, Date);
extend(DateTime.prototype, Date.prototype);
delete DateTime.prototype.toString;
DateTime.prototype._toString.$setValue(Date.prototype.toString);
