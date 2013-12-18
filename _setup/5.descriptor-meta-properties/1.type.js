'use strict';

var d              = require('d/d')
  , DbjsError      = require('../error')
  , isGetter       = require('../utils/is-getter')
  , turnPrototype  = require('../utils/propagate-prototype-turn').object
  , notifyDynamic  = require('../notify/dynamic')
  , notifyItems    = require('../notify/items')
  , notifyProperty = require('../notify/property')
  , notifyReverse  = require('../notify/reverse-all')

  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , nuCache, oldCache, confirmItem;

confirmItem = function (nu, old, item) {
	var oldStatus, nuStatus, sKey = item._sKey_, key = item.key;
	if (!oldCache) oldCache = create(null);
	if (oldCache[sKey] != null) oldStatus = oldCache[sKey];
	else oldStatus = oldCache[sKey] = (old.normalize(key, this) != null);
	if (!nuCache) nuCache = create(null);
	if (nuCache[sKey] != null) nuStatus = nuCache[sKey];
	else nuStatus = nuCache[sKey] = (nu.normalize(key, this) != null);
	if (oldStatus === nuStatus) return null;
	return nuStatus;
};

module.exports = function (db, descriptor) {
	var Base = db.Base, property, Type, baseEmitValue, baseSetValue
	  , isObjectType = db.isObjectType;

	Type = defineProperties(function (value) {
		if (Type.is(value)) return value;
		return Type.create(value);
	}, {
		create: d(function () {
			throw new DbjsError("Types must be created via extension from other" +
				" types. e.g. db.String.extend('NewStringType')", 'TYPE_TYPE_CREATE');
		}),
		extend: d(function () {
			throw new DbjsError("Cannot extend Type type", 'TYPE_TYPE_EXTEND');
		}),
		is: d(function (value) {
			if (value === Base) return true;
			if (Base.isPrototypeOf(value)) return true;
			return false;
		}),
		normalize: d(function (value) { return Type.is(value) ? value : Base; }),
		validate: d(function (value) {
			if (Type.is(value)) return value;
			throw new DbjsError(value + " is not a valid type", 'INVALID_TYPE');
		})
	});

	defineProperty(descriptor.__descriptorPrototype__, 'type', d('', Base));

	property = defineProperties(descriptor.$getOwn('type'), {
		type: d('', Type),
		_value_: d('w', Base)
	});

	baseSetValue = property._setValue_;
	baseEmitValue = property._emitValue_;

	defineProperties(property, {
		_sideNotify_: d(function (obj, pSKey, key, nu, old, dbEvent, postponed) {
			var desc, data, value, nuValue, oldValue, rMap, rKey, nuProto;

			if (!pSKey) return postponed;
			desc = obj.__descriptors__[pSKey];

			// Reverse property
			if ((desc.reverse !== undefined) && (obj.constructor.prototype === obj) &&
					isObjectType(obj.constructor)) {
				rMap = obj._getReverseMap_(pSKey);
				rKey = obj._serialize_(desc.reverse);
				if (isObjectType(old)) {
					postponed = notifyReverse(old.prototype, rKey, false, rMap,
						desc.unique, postponed);
				}
				if (isObjectType(nu)) {
					postponed = notifyReverse(nu.prototype, rKey, true, rMap,
						desc.unique, postponed);
				}
			}

			// Multiples
			postponed = notifyItems(obj, pSKey, desc.multiple,
				confirmItem.bind(desc, nu, old), dbEvent, postponed);

			// Nested
			if (obj.hasOwnProperty('__objects__')) {
				data = obj.__objects__[pSKey];
				if (data) {
					nuProto = isObjectType(nu) ? nu.prototype : Base.prototype;
					if (nuProto !== getPrototypeOf(data)) {
						postponed = turnPrototype(data, nu.prototype, dbEvent, postponed);
					}
				}
			}

			// Value
			if (desc._reverse_) return postponed;
			if (desc.nested) return postponed;

			value = desc._resolveValueValue_();
			if (value == null) return postponed;

			// Dynamics
			if (isGetter(value)) return notifyDynamic(obj, pSKey, dbEvent, postponed);
			if (desc.multiple) return postponed;

			return notifyProperty(obj, pSKey, value, value, function () {
				if (nuValue !== undefined) return nuValue;
				return (nuValue = nu.normalize(value, desc));
			}, function () {
				if (oldValue !== undefined) return oldValue;
				return (oldValue = old.normalize(value, desc));
			}, dbEvent, postponed);
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old = (this.hasOwnProperty('_value_') && this._value_) || undefined
			  , desc;
			if (nu === old) return;
			if (this._pSKey_) desc = this.object.__descriptors__[this._pSKey_];
			else desc = this.object.__descriptorPrototype__;
			if (old) old.__typeAssignments__._delete(desc);
			if (nu) nu._typeAssignments_._add(desc);
			baseSetValue.call(this, nu, dbEvent);
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			postponed = baseEmitValue.call(this, obj, nu, old, dbEvent, postponed);
			nuCache = oldCache = null;
			return postponed;
		})
	});
};
