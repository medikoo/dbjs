'use strict';

var d              = require('d/d')
  , isGetter       = require('../utils/is-getter')
  , observePass    = require('../utils/observe-pass-through')
  , updateEnum     = require('../utils/update-enumerability')
  , notifyGetter   = require('../notify/getter')
  , notifyProperty = require('../notify/property')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , notify, notifyDescs, resolve;

resolve = function (desc, sKey, value, isGet) {
	if (isGet) {
		if (desc.multiple) return this._getDynamicMultiple_(sKey);
		value = value.call(this, observePass);
		if (value == null) return null;
	} else if (desc.multiple) {
		return this._getMultiple_(sKey);
	}
	if (value == null) return value;
	return desc._normalizeValue_(value);
};

notify = function (obj, sKey, nu, old, nuGet, oldGet, dbEvent, postponed) {
	var desc = obj.__descriptors__[sKey] || obj.__descriptorPrototype__
	  , oldResolved, nuResolved, dynamicHandled;

	if (desc._reverse_) return;
	if (desc.nested) return;

	// Getter observers
	if (nuGet || oldGet) {
		postponed = notifyGetter(obj, sKey, nuGet ? nu : null, old, function () {
			dynamicHandled = true;
			if (nuGet) return resolve.call(obj, desc, sKey, old, oldGet);
			return resolve.call(obj, desc, sKey, nu, nuGet);
		}, desc.multiple, dbEvent, postponed);
		if (dynamicHandled) return postponed;
	}

	// Dynamic multiple
	if (desc.multiple) {
		if (nuGet === oldGet) return postponed;
		if (nu === undefined) nu = null;
		if (old === undefined) old = null;
	}

	return notifyProperty(obj, sKey, nu, old, function () {
		if (nuResolved) return nu;
		if (nuGet) nu = obj._getDynamicValue_(sKey).resolvedValue;
		else nu = resolve.call(obj, desc, sKey, nu, nuGet);
		nuResolved = true;
		return nu;
	}, oldResolved ? null : function () {
		if (oldResolved) return old;
		old = resolve.call(obj, desc, sKey, old, oldGet);
		oldResolved = true;
		return old;
	}, dbEvent, postponed);
};

notifyDescs = function (obj, sKey, nu, old, nuGet, oldGet, dbEvent, sideNotify,
	postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		var desc;
		if (obj.hasOwnProperty('__descriptors__')) {
			if (hasOwnProperty.call(obj.__descriptors__, sKey)) {
				desc = obj.__descriptors__[sKey];
				if (desc._reverse_) return;
				if (desc.nested) return;
				if (desc.hasOwnProperty('_value_')) return;
			}
		}
		postponed = notify(obj, sKey, nu, old, nuGet, oldGet, dbEvent, postponed);
		if (sideNotify) {
			postponed = sideNotify(obj, sKey, nu, old, nuGet, oldGet,
				dbEvent, postponed);
		}
		postponed = notifyDescs(obj, sKey, nu, old, nuGet, oldGet, dbEvent,
			sideNotify, postponed);
	});
	return postponed;
};

module.exports = function (db, descriptor) {
	defineProperties(descriptor, {
		_setValue_: d(function (nu, dbEvent) {
			var old, has = this.hasOwnProperty('_value_');
			old = has ? this._value_ : undefined;
			if (nu === old) return;
			if (!this._reverse_ && !this.nested && !this.multiple &&
					((old === undefined) || (nu === undefined))) {
				updateEnum(this.__master__, this._sKey_, (nu !== undefined));
			}
			if (old === undefined) old = this._resolveValueValue_();
			if (nu === undefined) delete this._value_;
			else if (has) this._value_ = nu;
			else defineProperty(this, '_value_', d('cw', nu));
			nu = this._resolveValueValue_();
			if (nu === old) return;
			db._release_(this._emitValue_(this.__master__, nu, old, dbEvent));
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			var nuGet, oldGet;
			nuGet = isGetter(nu);
			oldGet = isGetter(old);
			postponed = notify(obj, this._sKey_, nu, old, nuGet, oldGet,
				dbEvent, postponed);
			if (this._sideNotify_) {
				postponed = this._sideNotify_(obj, this._sKey_, nu, old, nuGet, oldGet,
					dbEvent, postponed);
			}
			return notifyDescs(obj, this._sKey_, nu, old, nuGet, oldGet, dbEvent,
				this._sideNotify_, postponed);
		})
	});
};
