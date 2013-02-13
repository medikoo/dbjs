'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , extend   = require('es5-ext/lib/Object/extend-properties')
  , isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')
  , Base     = require('./base')

  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , stringify = JSON.stringify

  , RegExpType, proto;

module.exports = RegExpType = extend(Base.$$create('RegExp'), RegExp);
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

proto = defineProperties(extend(RegExpType.prototype, RegExp.prototype), {
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
