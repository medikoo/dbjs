'use strict';

var isRegExp       = require('es5-ext/reg-exp/is-reg-exp')
  , mixin          = require('es5-ext/object/mixin')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , DbjsError      = require('../error')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (db) {
	var RegExpType = db.Base._extend_('RegExp')
	  , prototype = RegExp.prototype;

	defineProperty(RegExpType, 'prototype', d('', prototype));
	try { mixin(RegExpType, RegExp); } catch (ignore) {}
	if (RegExpType.prototype !== prototype) {
		// Happens in some engines (e.g. Safari 5.10)
		defineProperty(RegExpType, 'prototype', d('', prototype));
	}

	defineProperties(RegExpType, {
		is: d(function (value) {
			return (isRegExp(value) && (getPrototypeOf(value) === this.prototype));
		}),
		normalize: d(function (value) {
			if (!isRegExp(value)) {
				try {
					value = RegExp(value);
				} catch (e) {
					return null;
				}
			}
			return setPrototypeOf(value, this.prototype);
		}),
		validate: d(function (value) {
			if (!isRegExp(value)) {
				try {
					value = RegExp(value);
				} catch (e) {
					throw new DbjsError(value + " is invalid regular expression",
						'INVALID_REGEXP');
				}
			}
			return setPrototypeOf(value, this.prototype);
		}),
		compare: d(function (a, b) { return String(a).localeCompare(b); })
	});

	defineProperty(mixin(RegExpType.prototype, RegExp.prototype), 'constructor', d(RegExpType));
};
