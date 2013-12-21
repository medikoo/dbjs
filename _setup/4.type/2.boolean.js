'use strict';

var mixin = require('es5-ext/object/mixin')
  , d     = require('d/d')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties;

module.exports = function (db) {
	var BooleanType = db.Base._extend_('Boolean');

	defineProperty(BooleanType, 'prototype', d('', BooleanType.prototype));
	try { mixin(BooleanType, Boolean); } catch (ignore) {}

	defineProperties(BooleanType, {
		is: d(function (value) { return typeof value === 'boolean'; }),
		normalize: d(Boolean),
		validate: d(Boolean),
		compare: d(function (a, b) { return Boolean(a) - Boolean(b); }),
		trueLabel: d('True'),
		falseLabel: d('False')
	});

	defineProperties(mixin(BooleanType.prototype, Boolean.prototype), {
		constructor: d(BooleanType),
		toString: d(function (descriptor) {
			var name = this.valueOf() ? 'trueLabel' : 'falseLabel';
			if (descriptor && (descriptor[name] != null)) {
				return String(descriptor[name]);
			}
			return String(this.constructor[name]);
		})
	});
};
