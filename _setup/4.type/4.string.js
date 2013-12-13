'use strict';

var mixin     = require('es5-ext/object/mixin')
  , isRegExp  = require('es5-ext/reg-exp/is-reg-exp')
  , d         = require('d/d')
  , DbjsError = require('../error')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , min = Math.min, max = Math.max;

module.exports = function (db) {
	var StringType = db.Base._extend_('String');

	defineProperty(StringType, 'prototype', d('', StringType.prototype));
	try { mixin(StringType, String); } catch (ignore) {}

	defineProperties(StringType, {
		min: d(0),
		max: d(Infinity),
		is: d(function (value/*, descriptor*/) {
			var minv, maxv, descriptor = arguments[1];
			if (typeof value !== 'string') return false;
			if (descriptor && isRegExp(descriptor.pattern)) {
				if (!value.match(descriptor.pattern)) return false;
			}
			if (this.pattern && !value.match(this.pattern)) return false;
			minv = (descriptor && !isNaN(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value.length < minv) return false;
			maxv = (descriptor && !isNaN(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value.length > maxv) return false;
			return true;
		}),
		normalize: d(function (value/*, descriptor*/) {
			var minv, maxv, descriptor = arguments[1];
			value = String(value);
			if (descriptor && isRegExp(descriptor.pattern)) {
				if (!value.match(descriptor.pattern)) return null;
			}
			if (this.pattern && !value.match(this.pattern)) return null;
			minv = (descriptor && !isNaN(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value.length < minv) return null;
			maxv = (descriptor && !isNaN(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value.length > maxv) return null;
			return value;
		}),
		validate: d(function (value/*, descriptor*/) {
			var minv, maxv, descriptor = arguments[1];
			value = String(value);
			if (descriptor && isRegExp(descriptor.pattern)) {
				if (!value.match(descriptor.pattern)) {
					throw new DbjsError(value + " doesn't match pattern",
						'INVALID_STRING');
				}
			}
			if (this.pattern && !value.match(this.pattern)) {
				throw new DbjsError(value + " doesn't match pattern", 'INVALID_STRING');
			}
			minv = (descriptor && !isNaN(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value.length < minv) {
				throw new DbjsError("String too short", 'STRING_TOO_SHORT');
			}
			maxv = (descriptor && !isNaN(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value.length > maxv) {
				throw new DbjsError("String too long", 'STRING_TOO_LONG');
			}
			return value;
		})
	});

	mixin(StringType.prototype, String.prototype);
};
