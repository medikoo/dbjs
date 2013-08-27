'use strict';

var d            = require('es5-ext/object/descriptor')
  , extend       = require('es5-ext/object/extend-properties')
  , Base         = require('./base')

  , defineProperties = Object.defineProperties
  , stringify = JSON.stringify

  , StringType, NumberType, RegExpType, proto, rel;

module.exports = StringType = Base.$$create('String');
proto = StringType.prototype;
extend(StringType, String);
StringType.prototype = proto;

defineProperties(StringType, {
	_serialize_: d('c', function (value) {
		return '3' + stringify(value).slice(1, -1);
	})
});
StringType._is.$$setValue(function (value) {
	if (typeof value !== 'string') return false;
	if (this.pattern && !value.match(this.pattern)) return false;
	if (this.max && (value.length > this.max)) return false;
	if (this.min && (value.length < this.min)) return false;
	return true;
});
StringType._normalize.$$setValue(function (value) {
	value = String(value);
	if (this.pattern && !value.match(this.pattern)) return null;
	if (this.max && (value.length > this.max)) return null;
	if (this.min && (value.length < this.min)) return null;
	return value;
});

defineProperties(extend(proto, String.prototype), {
	$create: d(String),
	validateCreate: d(function (value) {
		value = String(value);
		if (this.ns.pattern && !value.match(this.ns.pattern)) {
			return new TypeError("Invalid value");
		}
		if (this.ns.max && (value.length > this.ns.max)) {
			return new TypeError(value + " is too long");
		}
		if (this.ns.min && (value.length < this.ns.min)) {
			return new TypeError(value + " is too short");
		}
		return null;
	})
});

// Properties
NumberType = require('./number');
RegExpType = require('./reg-exp');

rel = StringType.get('pattern');
rel._ns.$$setValue(RegExpType);

rel = StringType.get('min');
rel._ns.$$setValue(NumberType);

rel = StringType.get('max');
rel._ns.$$setValue(NumberType);

delete StringType.prototype.toString;
StringType.prototype._toString.$$setValue(String.prototype.toString);
