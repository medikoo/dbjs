'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , Map            = require('es6-map/primitive')
  , isGetter       = require('../utils/is-getter')
  , serialize      = require('../serialize/value')
  , DbjsError      = require('../error')
  , Set            = require('./reverse-set')

  , defineProperty = Object.defineProperty
  , ReverseMap;

ReverseMap = module.exports = function (obj, sKey) {
	var desc;
	Map.call(this);
	defineProperty(this, '__descriptor__', d('',
		desc = obj._getDescriptor_(sKey)));
	desc = desc.__descriptors__.reverse;
	if (!desc && (desc._value_ !== undefined)) obj._serialize_(desc._value_);
	this._includeObjBranch_(obj, sKey, null, true);
};
setPrototypeOf(ReverseMap, Map);

ReverseMap.prototype = Object.create(Map.prototype, {
	constructor: d(ReverseMap),
	_serialize: d(serialize),
	_includeObjBranch_: d(function (object, sKey, postponed, init) {
		postponed = this._includeObj_(object, sKey, postponed, init);
		if (!object.hasOwnProperty('__descendants__')) return;
		object.__descendants__._plainForEach_(function self(object) {
			postponed = this._includeObjBranch_(object, sKey, postponed, init);
		}, this);
		return postponed;
	}),
	_includeObj_: d(function (object, sKey, postponed, init) {
		var desc = object.__descriptors__[sKey], value, data, iKey, item;
		if (!desc._reverse_ && !desc.nested && desc.multiple) {
			value = desc._resolveValueValue_();
			if (isGetter(value)) return postponed;
			data = object.__multiples__[sKey];
			if (!data) return postponed;
			for (iKey in data) {
				item = data[iKey];
				if (!item._value_) continue;
				if (item._normalizeValue_() == null) continue;
				this._addRef_(item._sKey_, item._key_, object, item._lastEvent_,
					null, true);
			}
			return postponed;
		}
		value = object._get_(sKey);
		if (value == null) return postponed;
		return this._addRef_(serialize(value), value, object,
			object._getPropertyLastEvent_(sKey), postponed, init);
	}),
	_excludeObjBranch_: d(function (object, sKey, postponed) {
		postponed = this._excludeObj_(object, sKey, postponed);
		if (!object.hasOwnProperty('__descendants__')) return postponed;
		object.__descendants__._plainForEach_(function self(object) {
			postponed = this._excludeObjBranch_(object, sKey, postponed);
		}, this);
		return postponed;
	}),
	_excludeObj_: d(function (object, sKey, postponed) {
		var desc = object.__descriptors__[sKey], value, data, iKey, item;
		if (!desc._reverse_ && !desc.nested && desc.multiple) {
			value = desc._resolveValueValue_();
			if (isGetter(value)) return postponed;
			data = object.__multiples__[sKey];
			if (!data) return postponed;
			for (iKey in data) {
				item = data[iKey];
				if (!item._value_) continue;
				if (item._normalizeValue_() == null) continue;
				this._deleteRef_(item._sKey_, object, null, postponed);
			}
			return postponed;
		}
		value = object._get_(sKey);
		if (value == null) return postponed;
		return this._deleteRef_(serialize(value), object, null, postponed);
	}),
	_addRef_: d(function (sKey, key, value, dbEvent, postponed, init) {
		var set = this.__mapValuesData__[sKey];
		if (!set) {
			this.__mapValuesData__[sKey] = set =
				new Set(key, sKey, this.__descriptor__);
		}
		if (!init && set.__isObservable__) {
			set._postponed_ += 1;
			if (!postponed) postponed = [set];
			else postponed.push(set);
		}
		return set._add_(value, dbEvent, postponed, init);
	}),
	_deleteRef_: d(function (sKey, value, dbEvent, postponed) {
		var set;
		set = this.__mapValuesData__[sKey];
		if (set.__isObservable__) {
			set._postponed_ += 1;
			if (!postponed) postponed = [set];
			else postponed.push(set);
		}
		return set._delete_(value, dbEvent, postponed);
	}),

	_delete_: d(function (obj, ignore) {
		var sKey = '7' + obj.__id__, set = this.__mapValuesData__[sKey], rKey;
		if (!set) return;
		if (!set.size) return;
		rKey = this.__descriptor__._sKey_;
		set.forEach(function (rObj) {
			var desc;
			if (ignore === rObj) return;
			desc = rObj.__descriptors__[rKey] || rObj.__descriptorPrototype__;
			if (desc.multiple) rObj._multipleDelete_(rKey, obj, sKey);
			else rObj._delete_(rKey);
		});
	}),
	_validateDelete_: d(function (obj, ignore) {
		var set, rKey, sKey;
		if (!this.__descriptor__.unique) {
			throw new DbjsError("Cannot delete multiple property",
				'MULTIPLE_DELETE');
		}
		sKey = '7' + obj.__id__;
		set = this.__mapValuesData__[sKey];
		if (!set || !set.size) return obj;
		rKey = this.__descriptor__._sKey_;
		set.forEach(function (rObj) {
			var desc;
			if (ignore === rObj) return;
			desc = rObj.__descriptors__[rKey] || rObj.__descriptorPrototype__;
			if (desc.multiple) rObj._validateMultipleDelete_(rKey, obj);
			else rObj._validateDelete_(rKey);
		});
		return obj;
	}),
	_set_: d(function (obj, value) {
		var set, sKey;
		this._delete_(obj, value);
		sKey = '7' + obj.__id__;
		set = this.__mapValuesData__[sKey];
		if (set.has(value)) return;
		value._set_(this.__descriptor__._sKey_, obj);
	}),
	_validateSet_: d(function (obj, value) {
		if (!this.__descriptor__.unique) {
			throw new DbjsError("Cannot overwrite multiple property",
				'MULTIPLE_OVERRIDE');
		}
		this.__descriptor__.__object__.constructor.validate(value);
		this._validateDelete_(obj, value);
		value._validateSet_(this.__descriptor__._sKey_, obj);
		return value;
	}),
	get: d(function (obj) {
		if (this.__descriptor__.unique) return this._getSingular_(serialize(obj));
		return this._getMultiple_(serialize(obj), obj);
	}),
	getLastEvent: d(function (obj) {
		var set = this.__mapValuesData__[serialize(obj)];
		if (!set) return null;
		return set.lastEvent;
	}),
	has: d(function (value) {
		if (!this.__descriptor__.unique) return true;
		return this._anySingular_(serialize(value));
	}),
	_anySingular_: d(function (sKey) {
		var set = this.__mapValuesData__[sKey];
		if (!set) return false;
		return Boolean(set.size);
	}),
	_getMultiple_: d(function (sKey, key) {
		var set = this.__mapValuesData__[sKey];
		if (set) return set;
		return (this.__mapValuesData__[sKey] =
			new Set(key, sKey, this.__descriptor__));
	}),
	_getSingular_: d(function (sKey) {
		var set = this.__mapValuesData__[sKey];
		if (!set) return undefined;
		return set.last;
	})
});
