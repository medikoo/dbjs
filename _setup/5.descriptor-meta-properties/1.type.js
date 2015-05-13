'use strict';

var create         = require('es5-ext/object/create')
  , d              = require('d')
  , DbjsError      = require('../error')
  , isGetter       = require('../utils/is-getter')
  , turnPrototype  = require('../utils/propagate-prototype-turn').object
  , notifyDynamic  = require('../notify/dynamic')
  , notifyItems    = require('../notify/items')
  , notifyProperty = require('../notify/property')
  , notifyReverse  = require('../notify/reverse-all')

  , defineProperties = Object.defineProperties, defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys

  , nuCache, oldCache;

var confirmItem = function (nu, old, item) {
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
	var Base = db.Base, property, Type, baseSetValue
	  , isObjectType = db.isObjectType;

	var sideNotifyNested = function (obj, pSKey, nu, dbEvent, postponed) {
		var data, nestDesc, nestObjProto, nuProto, oldProto;
		data = obj.__objects__[pSKey];
		if (!data) return postponed;
		nestDesc = obj._getDescriptor_(pSKey);
		while (!nestDesc.hasOwnProperty('type')) nestDesc = getPrototypeOf(nestDesc);
		if (nestDesc.object !== obj) {
			nestObjProto = getPrototypeOf(obj);
			while (true) {
				if (nestObjProto.hasOwnProperty('__objects__') && nestObjProto.__objects__[pSKey]) {
					nuProto = nestObjProto.__objects__[pSKey];
					break;
				}
				if (nestDesc.object === nestObjProto) break;
				nestObjProto = getPrototypeOf(nestObjProto);
			}
		}
		if (!nuProto) nuProto = isObjectType(nu) ? nu.prototype : Base.prototype;
		oldProto = getPrototypeOf(data);
		if (nuProto === oldProto) return postponed;
		return turnPrototype(data, nuProto, dbEvent, postponed);
	};

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

	defineProperty(descriptor.__descriptorPrototype__, 'type', d('e', Base));

	property = defineProperties(descriptor.$getOwn('type'), {
		type: d('e', Type),
		_value_: d('w', Base)
	});
	defineProperty(descriptor, 'type', descriptor._accessors_.type);

	baseSetValue = property._setValue_;

	defineProperties(property, {
		_sideNotify_: d(function (obj, pSKey, key, nu, old, dbEvent, postponed) {
			var desc, value, nuValue, oldValue, rMap, rKey;

			if (!pSKey) return postponed;
			desc = obj.__descriptors__[pSKey];
			if (!desc) desc = obj.__descriptorPrototype__;

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
				postponed = sideNotifyNested(obj, pSKey, nu, dbEvent, postponed);
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
		_postNotify_: d(function () { nuCache = oldCache = null; }),
		_setValue_: d(function (nu, dbEvent) {
			var old = (this.hasOwnProperty('_value_') && this._value_) || undefined, desc, postponed;
			if (nu === old) return;
			if (this._pSKey_) desc = this.object.__descriptors__[this._pSKey_];
			else desc = this.object.__descriptorPrototype__;
			if (old) old.__typeAssignments__._delete(desc);
			if (nu) nu._typeAssignments_._add(desc);
			old = this._value_;
			baseSetValue.call(this, nu, dbEvent);
			if (nu !== old) return;
			if (!this.object.hasOwnProperty('__objects__')) return;
			if (this._pSKey_) {
				db._release_(sideNotifyNested(this.object, this._pSKey_, nu, dbEvent));
				return;
			}
			keys(this.object.__objects__).forEach(function (key) {
				postponed = sideNotifyNested(this.object, key, nu, dbEvent, postponed);
			}, this);
			db._release_(postponed);
		})
	});
};
