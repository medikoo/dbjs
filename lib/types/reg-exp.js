'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , extend   = require('es5-ext/lib/Object/extend-properties')
  , isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')
  , Base     = require('./base')

  , stringify = JSON.stringify

  , RegExpType;

module.exports = RegExpType = Base.create('RegExp', function (value) {
	if (isRegExp(value)) return value;
	try {
		return RegExp(value);
	} catch (e) {
		throw new TypeError(value + " is not regexp representation");
	}
}, {
	is: isRegExp,
	validate: function (value) {
		if (isRegExp(value)) return null;
		try {
			RegExp(value);
		} catch (e) {
			return new TypeError(value + " is not regexp representation");
		}
		return null;
	},
	normalize: function (value) {
		if (isRegExp(value)) return value;
		try {
			return RegExp(value);
		} catch (e) {
			return null;
		}
	}
});

Object.defineProperties(RegExpType, {
	coerce: d('c', RegExpType.normalize),
	_serialize_: d('c', function (value) {
		return '5' + stringify(String(value)).slice(1, -1);
	})
});

extend(RegExpType, RegExp);
extend(RegExpType.prototype, RegExp.prototype);
delete RegExpType.prototype.toString;
RegExpType.prototype._toString.$set(RegExp.prototype.toString);
