'use strict';

var mixin     = require('es5-ext/object/mixin')
  , d         = require('d')
  , DbjsError = require('../error')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , abs = Math.abs, floor = Math.floor, max = Math.max, min = Math.min;

module.exports = function (db) {
	var NumberType = db.Base._extend_('Number')
	  , prototype = NumberType.prototype;

	defineProperty(NumberType, 'prototype', d('', prototype));
	try { mixin(NumberType, Number); } catch (ignore) {}
	if (NumberType.prototype !== prototype) {
		// Happens in some engines (e.g. Safari 5.10)
		defineProperty(NumberType, 'prototype', d('', prototype));
	}

	defineProperties(NumberType, {
		NativePrimitive: d(Number),
		min: d('cew', -Infinity),
		max: d('cew', Infinity),
		step: d('cew', 0),
		is: d(function (value/*, descriptor*/) {
			var minv, maxv, step, descriptor = arguments[1];
			if (typeof value !== 'number') return false;
			if (isNaN(value)) return false;
			minv = (descriptor && !isNaN(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) return false;
			maxv = (descriptor && !isNaN(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) return false;
			step = (descriptor && !isNaN(descriptor.step))
				? max(descriptor.step, this.step)
				: this.step;
			if (step && ((value % step) !== 0)) return false;
			return true;
		}),
		normalize: d(function (value/*, descriptor*/) {
			var minv, maxv, step, trail, sign, descriptor = arguments[1];
			if (isNaN(value)) return null;
			value = Number(value);
			minv = (descriptor && !isNaN(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) return null;
			maxv = (descriptor && !isNaN(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) return null;
			step = (descriptor && !isNaN(descriptor.step))
				? max(descriptor.step, this.step)
				: this.step;
			if (!step) return value;
			trail = value % step;
			if (!trail) return value;
			sign = (value >= 0) ? 1 : -1;
			return sign * floor(abs(value) * (1 / step)) * step;
		}),
		validate: d(function (value/*, descriptor*/) {
			var minv, maxv, step, trail, sign, descriptor = arguments[1];
			if (isNaN(value)) {
				throw new DbjsError(value + " is not valid number", 'INVALID_NUMBER');
			}
			value = Number(value);
			minv = (descriptor && !isNaN(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) {
				throw new DbjsError("Value cannot be less than " + minv,
					'NUMBER_TOO_SMALL');
			}
			maxv = (descriptor && !isNaN(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) {
				throw new DbjsError("Value cannot be greater than " + maxv,
					'NUMBER_TOO_LARGE');
			}
			step = (descriptor && !isNaN(descriptor.step))
				? max(descriptor.step, this.step)
				: this.step;
			if (!step) return value;
			trail = value % step;
			if (!trail) return value;
			sign = (value >= 0) ? 1 : -1;
			return sign * floor(abs(value) * (1 / step)) * step;
		}),
		compare: d(function (a, b) { return Number(a) - Number(b); })
	});

	mixin(NumberType.prototype, Number.prototype);
};
