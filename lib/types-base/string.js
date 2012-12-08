'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , extend     = require('es5-ext/lib/Object/extend-properties')
  , Base       = require('./base')
  , define     = require('../_internals/define-basic')
  , NumberType = require('./number')
  , RegExpType = require('./reg-exp')

  , stringify = JSON.stringify

  , StringType;

module.exports = StringType = Base.$create('String');
StringType._construct.$setValue(function (value) {
	value = String(value);
	if (this.pattern && !value.match(this.pattern)) {
		throw new TypeError(value + " is not valid " + this.__id);
	}
	if (this.max && (value.length > this.max)) {
		throw new TypeError(value + " is too long");
	}
	if (this.min && (value.length < this.min)) {
		throw new TypeError(value + " is too short");
	}
	return value;
});
StringType._$construct.$setValue(String);
StringType._is.$setValue(function (value) {
	if (typeof value !== 'string') return false;
	if (this.pattern && !value.match(this.pattern)) return false;
	if (this.max && (value.length > this.max)) return false;
	if (this.min && (value.length < this.min)) return false;
	return true;
});
StringType._normalize.$setValue(function (value) {
	value = String(value);
	if (this.pattern && !value.match(this.pattern)) return null;
	if (this.max && (value.length > this.max)) return null;
	if (this.min && (value.length < this.min)) return null;
	return value;
});
StringType._validate.$setValue(function (value) {
	value = String(value);
	if (this.pattern && !value.match(this.pattern)) {
		return new TypeError(value + " is not valid " + this.__id);
	}
	if (this.max && (value.length > this.max)) {
		return new TypeError(value + " is too long");
	}
	if (this.min && (value.length < this.min)) {
		return new TypeError(value + " is too short");
	}
	return null;
});

define(StringType, 'pattern');
Object.defineProperties(StringType._pattern, {
	_normalize: d(RegExpType.normalize),
	validate: d(RegExpType.validate)
});
define(StringType, 'min');
Object.defineProperties(StringType._min, {
	_normalize: d(Number),
	validate: d(NumberType._min.validate)
});
define(StringType, 'max');
Object.defineProperties(StringType._max, {
	_normalize: d(Number),
	validate: d(NumberType._min.validate)
});

Object.defineProperties(StringType, {
	coerce: d('c', String),
	_serialize_: d('c', function (value) {
		return '3' + stringify(value).slice(1, -1);
	})
});

extend(StringType, String);
extend(StringType.prototype, String.prototype);
delete StringType.prototype.toString;
StringType.prototype._toString.$setValue(String.prototype.toString);