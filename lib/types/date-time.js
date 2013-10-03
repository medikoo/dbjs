'use strict';

var isDate     = require('es5-ext/date/is-date')
  , mixin      = require('es5-ext/object/mixin')
  , d          = require('d/d')
  , Base       = require('./base')
  , NumberType = require('./number')

  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , DateTime, proto;

module.exports = DateTime = Base.$$create('DateTime');
proto = DateTime.prototype;
Object.defineProperty(DateTime, 'prototype', d('', proto));
try { mixin(DateTime, Date); } catch (ignore) {}

defineProperties(DateTime, {
	_serialize_: d('c', function (value) { return '4' + Number(value); }),
	compare: d('c', NumberType.compare)
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

defineProperties(mixin(proto, Date.prototype), {
	$create: d(
		function (value/*[, month[, date[, hours[, minutes[, seconds[, ms]]]]]]*/) {
			var l = arguments.length;
			if (!l) {
				value = new Date();
			} else if (l > 1) {
				value = new Date(value, arguments[1], (l > 2) ? arguments[2] : 1,
					(l > 3) ? arguments[3] : 0, (l > 4) ? arguments[4] : 0,
					(l > 5) ? arguments[5] : 0, (l > 6) ? arguments[6] : 0);
			} else {
				value = new Date(value);
			}
			value.__proto__ = this;
			value.$construct();
			return value;
		}
	),
	validateCreate: d(
		function (value/*[, month[, date[, hours[, minutes[, seconds[, ms]]]]]]*/) {
			var l = arguments.length;
			if (!l) return null;
			if (l > 1) {
				value = new Date(value, arguments[1], (l > 2) ? arguments[2] : 1,
					(l > 3) ? arguments[3] : 0, (l > 4) ? arguments[4] : 0,
					(l > 5) ? arguments[5] : 0, (l > 6) ? arguments[6] : 0);
			} else {
				value = new Date(value);
			}
			if (isNaN(value)) return new TypeError(value + " is invalid date value");
			return null;
		}
	)
});
proto._$construct.$$setValue(function (value) {});
delete proto.toString;
proto._toString.$$setValue(function () {
	var proto = this.__proto__, value, locale = this.Db.locale;
	this.__proto__ = Date.prototype;
	value = this.toLocaleString(locale);
	this.__proto__ = proto;
	return value;
});
