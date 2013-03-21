'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , Base   = require('./base')

  , defineProperties = Object.defineProperties
  , abs = Math.abs, floor = Math.floor

  , NumberType, proto, rel;

module.exports = NumberType = Base.$$create('Number');
proto = NumberType.prototype;
extend(NumberType, Number);
NumberType.prototype = proto;

defineProperties(NumberType, {
	_serialize_: d('c', function (value) { return '2' + value; }),
	compare: d('c', function (a, b) {
		if (a == null) {
			if (b == null) return 0;
			return -Infinity;
		}
		if (b == null) return Infinity;
		return a - b;
	})
});
NumberType._is.$$setValue(function (value) {
	return (typeof value === 'number') && (this.min < value) &&
		(this.max > value) && (!this.step || ((value % this.step) === 0));
});
NumberType._normalize.$$setValue(function (value) {
	var trail, sign;
	if (isNaN(value) || (this.min > value) || (this.max < value)) return null;
	value = Number(value);
	if (this.step) {
		trail = value % this.step;
		if (!trail) return value;
		sign = (value >= 0) ? 1 : -1;
		return sign * floor(abs(value) * (1 / this.step)) * this.step;
	}
	return value;
});

defineProperties(extend(proto, Number.prototype), {
	$create: d(function (value) { return this.ns.normalize(value); }),
	validateCreate: d(function (value) {
		if (isNaN(value) || (this.ns.min > value) || (this.ns.max < value)) {
			return new TypeError(value + " is invalid " + this.ns._id_);
		}
		return null;
	})
});

// Properties
rel = NumberType.get('min');
rel.$$setValue(-Infinity);
rel._ns.$$setValue(NumberType);
rel._required.$$setValue(true);

rel = NumberType.get('max');
rel.$$setValue(Infinity);
rel._ns.$$setValue(NumberType);
rel._required.$$setValue(true);

rel = NumberType.get('step');
rel._ns.$$setValue(NumberType);

delete proto.toString;
proto._toString.$$setValue(Number.prototype.toString);
