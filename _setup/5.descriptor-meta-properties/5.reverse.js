'use strict';

var d             = require('d/d')
  , DbjsError     = require('../error')
  , notifyReverse = require('../notify/reverse-all')
  , baseNotify    = require('../notify/desc-property')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

module.exports = function (db, descriptor) {
	var Base = db.Base, property, isObjectType = db.isObjectType;

	property = descriptor.$getOwn('reverse');

	defineProperties(property, {
		type: d('', db.Base),
		_resolveValue_: d(function () {
			if (!this.hasOwnProperty('_value_')) return;
			return this._value_;
		}),
		_hasValue_: d(function () {
			if (!this.hasOwnProperty('_value_')) return false;
			return (this._value_ !== undefined);
		}),
		_validateSet_: d(function (key, value) {
			var desc, obj;
			this._assertWritable_(key);
			if (value === undefined) {
				throw new DbjsError("Cannot set value to undefined", 'SET_UNDEFINED');
			}
			Base.validate(value);
			if (!this._pKey_) {
				throw new DbjsError("Cannot set reverse on descriptor prototype",
					'PROTOTYPE_PROPERTY_REVERSE');
			}
			obj = this.__object__;
			desc = obj.__descriptors__[this._pKey_] || obj.__descriptorPrototype__;
			if (!isObjectType(desc.type)) {
				throw new DbjsError("Cannot set reverse for non object type",
					'NON_OBJECT_REVERSE');
			}
			if (obj.constructor.prototype !== obj) {
				throw new DbjsError("Reverse can be set only on property of prototype",
					'NON_PROTOTYPE_REVERSE');
			}
			if (!isObjectType(obj.constructor)) {
				throw new DbjsError("Reverse can be set only on property of object" +
					" type prototype", 'NON_PROTOTYPE_REVERSE');
			}
			return value;
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old, has = this.hasOwnProperty('_value_'), postponed;
			old = has ? this._value_ : undefined;
			if (nu === old) return;
			if (nu === undefined) delete this._value_;
			else if (has) this._value_ = nu;
			else defineProperty(this, '_value_', d('cw', nu));
			postponed = baseNotify(this.__object__, this._pKey_, this._sKey_,
				nu, old, dbEvent);
			db._release_(this._sideNotify_(this.__object__, this._pKey_,
				nu, old, dbEvent, postponed));
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			throw new TypeError("Reverse property doesn't leak through prototypes");
		}),
		_sideNotify_: d(function (obj, pKey, nu, old, dbEvent, postponed) {
			var desc, map;
			if (!pKey) return postponed;
			desc = obj.__descriptors__[pKey];
			if (!isObjectType(desc.type)) return postponed;
			if (obj.constructor.prototype !== obj) return postponed;
			if (!isObjectType(obj.constructor)) return postponed;

			map = obj._getReverseMap_(pKey);
			if (old !== undefined) {
				// Clear old
				postponed = notifyReverse(desc.type.prototype, obj._serialize_(old),
					false, map, desc.unique, postponed);
			}

			if (nu === undefined) return postponed;
			// Update new
			return notifyReverse(desc.type.prototype, obj._serialize_(nu), true, map,
				desc.unique, postponed);
		})
	});
};
