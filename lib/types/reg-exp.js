'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , extend   = require('es5-ext/lib/Object/extend-properties')
  , isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')
  , root     = require('./root')

  , stringify = JSON.stringify

  , RegExpType;

module.exports = RegExpType = root.create('RegExp', function (value) {
	if (isRegExp(value)) return value;
	try {
		return RegExp(value);
	} catch (e) {
		throw new TypeError(value + " is not regexp representation");
	}
}, {
	is: isRegExp,
	validate: function (value) {
		if (isRegExp(value)) return;
		try {
			RegExp(value);
		} catch (e) {
			return new TypeError(value + " is not regexp representation");
		}
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

Object.defineProperty(RegExpType, 'coerce', d('c', RegExpType._normalize));
Object.defineProperties(RegExpType, {
	coerce: d('c', RegExpType._normalize),
	__serialize: d('c', function (value) {
		return '5' + stringify(String(value)).slice(1, -1);
	})
});

extend(RegExpType, RegExp);
extend(RegExpType.prototype, RegExp.prototype);
