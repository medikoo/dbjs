'use strict';

var isInteger         = require('es5-ext/number/is-integer')
  , isNumber          = require('es5-ext/object/is-number-value')
  , mixin             = require('es5-ext/object/mixin')
  , normalizeOptions  = require('es5-ext/object/normalize-options')
  , assign            = require('es5-ext/object/assign')
  , toStringTagSymbol = require('es6-symbol').toStringTag
  , d                 = require('d')
  , BigNumber         = require('bignumber.js')
  , DbjsError         = require('../error')

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
			minv = (descriptor && isNumber(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) return false;
			maxv = (descriptor && isNumber(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) return false;
			step = (descriptor && isNumber(descriptor.step))
				? descriptor.step : this.step;
			if (!step) return true;
			if (isInteger(step)) return ((value % step) === 0);
			return (Number((new BigNumber(String(value))).mod(step)) === 0);
		}),
		normalize: d(function (value/*, descriptor*/) {
			var minv, maxv, step, trail, sign, descriptor = arguments[1];
			if (isNaN(value)) return null;
			value = Number(value);
			minv = (descriptor && isNumber(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) return null;
			maxv = (descriptor && isNumber(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) return null;
			step = (descriptor && isNumber(descriptor.step))
				? descriptor.step : this.step;
			if (!step) return value;
			trail = isInteger(step) ? (value % step) : Number((new BigNumber(String(value))).mod(step));
			if (!trail) return value;
			sign = (value >= 0) ? 1 : -1;
			return sign * floor(abs(value) * (1 / step)) * step;
		}),
		validate: d(function (value/*, descriptor*/) {
			var minv, maxv, step, trail, sign, descriptor = arguments[1];
			if (isNaN(value)) {
				throw new DbjsError(value + " is not valid number", 'INVALID_NUMBER',
					{ descriptor: descriptor });
			}
			value = Number(value);
			minv = (descriptor && isNumber(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) {
				throw new DbjsError("Value cannot be less than " + minv,
					'NUMBER_TOO_SMALL', { descriptor: descriptor });
			}
			maxv = (descriptor && isNumber(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) {
				throw new DbjsError("Value cannot be greater than " + maxv,
					'NUMBER_TOO_LARGE', { descriptor: descriptor });
			}
			step = (descriptor && isNumber(descriptor.step))
				? descriptor.step : this.step;
			if (!step) return value;
			trail = isInteger(step) ? (value % step) : Number((new BigNumber(String(value))).mod(step));
			if (!trail) return value;
			sign = (value >= 0) ? 1 : -1;
			return sign * floor(abs(value) * (1 / step)) * step;
		}),
		compare: d(function (a, b) { return Number(a) - Number(b); })
	});

	defineProperties(mixin(NumberType.prototype, Number.prototype), {
		constructor: d(NumberType),
		toString: d(function (descriptor/*, formattingOptions*/) {
			var formattingOptions = normalizeOptions(arguments[1]), num = 0;
			var step = (descriptor && isNumber(descriptor.step))
				? descriptor.step : this.constructor.step;

			if (step) {
				while (step < 1) {
					++num;
					step *= 10;
				}

				return this.valueOf().toLocaleString(this.database.locale, assign({
					minimumFractionDigits: num,
					maximumFractionDigits: num
				}, formattingOptions));
			}

			return this.valueOf().toLocaleString(this.database.locale, formattingOptions);
		})
	});
	defineProperty(NumberType.prototype, toStringTagSymbol, d('Number'));
};
