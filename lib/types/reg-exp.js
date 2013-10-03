'use strict';

var mixin    = require('es5-ext/object/mixin')
  , isRegExp = require('es5-ext/reg-exp/is-reg-exp')
  , d        = require('d/d')
  , Base     = require('./base')

  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , stringify = JSON.stringify

  , RegExpType, proto;

module.exports = RegExpType = Base.$$create('RegExp');
proto = RegExpType.prototype;
Object.defineProperty(RegExpType, 'prototype', d('', proto));
try { mixin(RegExpType, RegExp); } catch (ignore) {}

defineProperties(RegExpType, {
	_serialize_: d('c', function (value) {
		return '5' + stringify(String(value)).slice(1, -1);
	})
});
RegExpType._is.$$setValue(function (value) {
	return isRegExp(value) && (getPrototypeOf(value) === proto);
});
RegExpType._normalize.$$setValue(function (value) {
	if (!isRegExp(value)) {
		try {
			value = RegExp(value);
		} catch (e) {
			return null;
		}
	}
	value.__proto__ = proto;
	return value;
});

defineProperties(mixin(proto, RegExp.prototype), {
	$create: d(RegExp),
	validateCreate: d(function (value) {
		if (isRegExp(value)) return null;
		try {
			RegExp(value);
		} catch (e) {
			return new TypeError(value + " is not regexp representation");
		}
		return null;
	})
});
delete proto.toString;
proto._toString.$$setValue(RegExp.prototype.toString);
