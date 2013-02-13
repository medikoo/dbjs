'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , d          = require('es5-ext/lib/Object/descriptor')
  , extend     = require('es5-ext/lib/Object/extend-properties')
  , Base       = require('./base')
  , StringType = require('./string')

  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , stringify = JSON.stringify

  , FunctionType, proto;

module.exports = FunctionType = extend(Base.$$create('Function'), Function);
defineProperties(FunctionType, {
	_serialize_: d('c', function (value) {
		return '6' + stringify(String(value)).slice(1, -1);
	}),
	compare: d('c', StringType.compare)
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

proto = defineProperties(extend(FunctionType.prototype, Function.prototype), {
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
