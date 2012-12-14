'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , Base   = require('./base')
  , define = require('../_internals/define-basic')

  , abs = Math.abs, floor = Math.floor
  , NumberType, validate;

module.exports = NumberType = Base.$create('Number');
NumberType._construct.$setValue(function (value) {
	var error = this.validate(value);
	if (error) throw error;
	return this.normalize(value);
});
NumberType._$construct.$setValue(Number);
NumberType._is.$setValue(function (value) {
	return (typeof value === 'number') && (this.min < value) &&
		(this.max > value) && (!this.step || ((value % this.step) === 0));
});
NumberType._validate.$setValue(function (value) {
	if (isNaN(value) || (this.min > value) || (this.max < value)) {
		return new TypeError(value + " is invalid " + this._id_);
	}
	return null;
});
NumberType._normalize.$setValue(function (value) {
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

define(NumberType, 'min', -Infinity);
Object.defineProperties(NumberType._min, {
	_normalize: d(Number),
	validate: d(validate = function (value) {
		if (isNaN(value)) return new TypeError(value + ' is not a number');
		return null;
	})
});
define(NumberType, 'max', Infinity);
Object.defineProperties(NumberType._max, {
	_normalize: d(Number),
	validate: d(validate)
});

define(NumberType, 'step');
Object.defineProperties(NumberType._step, {
	_normalize: d(function (value) {
		value = Number(value);
		return value ? Math.max(value, 0) : null;
	}),
	validate: d(validate)
});

Object.defineProperties(NumberType, {
	coerce: d('c', function (value) {
		return isNaN(value) ? null : Number(value);
	}),
	_serialize_: d('c', function (value) { return '2' + value; })
});

extend(NumberType, Number);
extend(NumberType.prototype, Number.prototype);
delete NumberType.prototype.toString;
NumberType.prototype._toString.$setValue(Number.prototype.toString);
