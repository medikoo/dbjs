'use strict';

var isDate            = require('es5-ext/date/is-date')
  , copy              = require('es5-ext/date/#/copy')
  , isNumber          = require('es5-ext/object/is-number-value')
  , mixin             = require('es5-ext/object/mixin')
  , setPrototypeOf    = require('es5-ext/object/set-prototype-of')
  , toStringTagSymbol = require('es6-symbol').toStringTag
  , d                 = require('d')
  , DbjsError         = require('../error')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , abs = Math.abs, floor = Math.floor, max = Math.max, min = Math.min;

module.exports = function (db) {
	var DateTime = db.Base._extend_('DateTime')
	  , prototype = DateTime.prototype;

	defineProperty(DateTime, 'prototype', d('', prototype));
	try { mixin(DateTime, Date); } catch (ignore) {}
	if (DateTime.prototype !== prototype) {
		// Happens in some engines (e.g. Safari 5.10)
		defineProperty(DateTime, 'prototype', d('', prototype));
	}

	defineProperties(DateTime, {
		min: d('cew', -Infinity),
		max: d('cew', Infinity),
		step: d('cew', 0),
		is: d(function (value/*, descriptor*/) {
			var minv, maxv, step, descriptor = arguments[1];
			if (!isDate(value)) return false;
			if (isNaN(value)) return false;
			if (getPrototypeOf(value) !== this.prototype) return false;
			minv = (descriptor && isNumber(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) return false;
			maxv = (descriptor && isNumber(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) return false;
			step = (descriptor && isNumber(descriptor.step))
				? max(descriptor.step, this.step)
				: this.step;
			if (step && ((value % step) !== 0)) return false;
			return true;
		}),
		normalize: d(function (value/*, descriptor*/) {
			var minv, maxv, step, trail, sign, descriptor = arguments[1]
			  , copied;
			if (!isDate(value)) {
				value = new Date(value);
				copied = true;
			}
			if (isNaN(value)) return null;
			minv = (descriptor && isNumber(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) return null;
			maxv = (descriptor && isNumber(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) return null;
			step = (descriptor && isNumber(descriptor.step))
				? max(descriptor.step, this.step)
				: this.step;
			if (!step) return setPrototypeOf(value, this.prototype);
			trail = value % step;
			if (!trail) return setPrototypeOf(value, this.prototype);
			sign = (value >= 0) ? 1 : -1;
			if (!copied) value = copy.call(value);
			value.setTime(sign * floor(abs(value) * (1 / step)) * step);
			return setPrototypeOf(value, this.prototype);
		}),
		validate: d(function (value/*, descriptor*/) {
			var minv, maxv, step, trail, sign, descriptor = arguments[1]
			  , copied;
			if (!isDate(value)) {
				value = new Date(value);
				copied = true;
			}
			if (isNaN(value)) {
				throw new DbjsError(value + " is invalid datetime", 'INVALID_DATETIME',
					{ descriptor: descriptor });
			}
			minv = (descriptor && isNumber(descriptor.min))
				? max(descriptor.min, this.min)
				: this.min;
			if (value < minv) {
				throw new DbjsError("Date cannot be before " + minv, 'PAST_DATE',
					{ descriptor: descriptor });
			}
			maxv = (descriptor && isNumber(descriptor.max))
				? min(descriptor.max, this.max)
				: this.max;
			if (value > maxv) {
				throw new DbjsError("Date cannot be after " + maxv, 'FUTURE_DATE',
					{ descriptor: descriptor });
			}
			step = (descriptor && isNumber(descriptor.step))
				? max(descriptor.step, this.step)
				: this.step;
			if (!step) return setPrototypeOf(value, this.prototype);
			trail = value % step;
			if (!trail) return setPrototypeOf(value, this.prototype);
			sign = (value >= 0) ? 1 : -1;
			if (!copied) value = copy.call(value);
			value.setTime(sign * floor(abs(value) * (1 / step)) * step);
			return setPrototypeOf(value, this.prototype);
		}),
		compare: d(function (a, b) { return a - b; }),
		_validateCreate_: d(function (value/*[, mth[, d[, h[, mn[, s[, ms]]]]]]*/) {
			var l = arguments.length;
			if (!l) {
				value = new Date();
			} else if (l === 1) {
				value = new Date(value);
			} else {
				value = new Date(value, arguments[1], (l > 2) ? arguments[2] : 1,
					(l > 3) ? arguments[3] : 0, (l > 4) ? arguments[4] : 0,
					(l > 5) ? arguments[5] : 0, (l > 6) ? arguments[6] : 0);
			}
			return [this.validate(value)];
		})
	});

	defineProperties(mixin(DateTime.prototype, Date.prototype), {
		constructor: d(DateTime),
		toString: d(function () { return this.toLocaleString(db.locale); }),
		toLocaleDateString: d(function (locale) {
			var proto = getPrototypeOf(this), value;
			setPrototypeOf(this, Date.prototype);
			value = this.toLocaleDateString.apply(this, arguments);
			setPrototypeOf(this, proto);
			return value;
		}),
		toLocaleTimeString: d(function (locale) {
			var proto = getPrototypeOf(this), value;
			setPrototypeOf(this, Date.prototype);
			value = this.toLocaleTimeString.apply(this, arguments);
			setPrototypeOf(this, proto);
			return value;
		}),
		toLocaleString: d(function (locale) {
			var proto = getPrototypeOf(this), value;
			setPrototypeOf(this, Date.prototype);
			value = this.toLocaleString.apply(this, arguments);
			setPrototypeOf(this, proto);
			return value;
		})
	});
	defineProperty(DateTime.prototype, toStringTagSymbol, d('Date'));
};
