'use strict';

var isFunction = require('es5-ext/function/is-function')
  , mixin      = require('es5-ext/object/mixin')
  , d          = require('d/d')
  , Base       = require('./base')

  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , stringify = JSON.stringify

  , FunctionType, proto;

module.exports = FunctionType = Base.$$create('Function');
proto = FunctionType.prototype;
Object.defineProperty(FunctionType, 'prototype', d('', proto));
try { mixin(FunctionType, Function); } catch (ignore) {}

defineProperties(FunctionType, {
	_serialize_: d('c', function (value) {
		return '6' + stringify(String(value)).slice(1, -1);
	})
});
FunctionType._is.$$setValue(function (value) {
	return (isFunction(value) && value.length &&
		(getPrototypeOf(value) === proto)) || false;
});
FunctionType._normalize.$$setValue(function (value) {
	if (!isFunction(value) || !value.length) return null;
	value.__proto__ = proto;
	return value;
});

defineProperties(mixin(proto, Function.prototype), {
	$create: d(function (value) {
		value.__proto__ = proto;
		return value;
	}),
	validateCreate: d(function (value) {
		if (isFunction(value)) {
			if (!value.length) return new TypeError(value + " is getter-like");
			return null;
		}
		return new TypeError(value + " is not a function");
	})
});
delete proto.toString;
proto._toString.$$setValue(Function.prototype.toString);
