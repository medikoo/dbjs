'use strict';

var d         = require('d')
  , emitValue = require('../utils/emit-desc-desc-value')
  , Event     = require('../event')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

module.exports = function (db, property) {
	defineProperties(property, {
		_destroy_: d(function () {
			if (!this.hasOwnProperty('_value_')) return;
			new Event(this); //jslint: ignore
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old, has = this.hasOwnProperty('_value_'), obj, desc;
			old = has ? this._value_ : undefined;
			if (nu === old) return;
			if ((nu === undefined) || (old === undefined)) {
				obj = this.object;
				if (this._pSKey_) {
					if (obj.hasOwnProperty('__descriptors__')) {
						obj = obj.__descriptors__;
						if (hasOwnProperty.call(obj, this._pSKey_)) desc = obj[this._pSKey_];
					}
				} else if (obj.hasOwnProperty('__descriptorPrototype__')) {
					desc = obj.__descriptorPrototype__;
				}
				if (desc) {
					if (nu === undefined) {
						if (desc.hasOwnProperty(this.key)) delete desc[this.key];
					} else if (!desc.hasOwnProperty(this.key)) {
						defineProperty(desc, this.key, desc._accessors_[this.key]);
					}
				}
			}
			old = this._value_;
			if (old != null) old = this.type.normalize(old);
			if (nu === undefined) delete this._value_;
			else if (has) this._value_ = nu;
			else defineProperty(this, '_value_', d('cw', nu));
			nu = this._value_;
			if (nu != null) nu = this.type.normalize(nu);
			if (nu === old) return;
			db._release_(this._emitValue_(this.object, nu, old, dbEvent));
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			return emitValue(obj, nu, old, this._pSKey_, this.key, this._sideNotify_,
				this._postNotify_, dbEvent, postponed);
		})
	});
};
