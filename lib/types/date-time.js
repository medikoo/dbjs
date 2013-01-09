'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , Base   = require('./base')

  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , DateTime, proto;

module.exports = DateTime = extend(Base.$$create('DateTime'), Date);
defineProperties(DateTime, {
	_serialize_: d('c', function (value) { return '4' + Number(value); })
});
DateTime._is.$$setValue(function (value) {
	return isDate(value) && !isNaN(value) &&
		(getPrototypeOf(value) === this.prototype);
});
DateTime._normalize.$$setValue(function (value) {
	if (!isDate(value)) value = new Date(value);
	if (isNaN(value)) return null;
	value.__proto__ = this.prototype;
	return value;
});

proto = defineProperties(extend(DateTime.prototype, Date.prototype), {
	$create: d(function (value) {
		if (value == null) value = new Date();
		else value = new Date(value);
		value.__proto__ = this;
		value.$construct();
		return value;
	}),
	validateCreate: d(function (value) {
		if ((value != null) && isNaN(isDate(value) ? value : new Date(value))) {
			return new TypeError(value + " is invalid date value");
		}
		return null;
	})
});
proto._$construct.$$setValue(function (value) {});
delete proto.toString;
proto._toString.$$setValue(Date.prototype.toString);
