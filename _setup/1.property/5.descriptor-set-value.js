'use strict';

var d              = require('d')
  , isGetter       = require('../utils/is-getter')
  , observePass    = require('../utils/observe-pass-through')
  , updateEnum     = require('../utils/update-enumerability')
  , notifyGetter   = require('../notify/getter')
  , notifyProperty = require('../notify/property')
  , Event          = require('../event')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty, keys = Object.keys
  , destroy = function (sKey) { this[sKey]._destroy_(); }
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
	var desc = obj._getDescriptor_(sKey), oldResolved, nuResolved, dynamicHandled;

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
		_destroy_: d(function () {
			var data;
			if (this.hasOwnProperty('__descriptors__')) {
				keys(this.__descriptors__).forEach(destroy, this.__descriptors__);
			}
			if (!this._sKey_) return;
			data = this.object;
			if (data.hasOwnProperty('__multiples__')) {
				data = data.__multiples__;
				if (hasOwnProperty.call(data, this._sKey_)) {
					data = data[this._sKey_];
					keys(data).forEach(destroy, data);
				}
			}
			if (!this.hasOwnProperty('_value_')) return;
			new Event(this); //jslint: ignore
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old, has = this.hasOwnProperty('_value_'), postponed, assignments;
			old = has ? this._value_ : undefined;
			if (nu === old) return;
			if (!this._reverse_ && !this.nested && !this.multiple &&
					((old === undefined) || (nu === undefined))) {
				updateEnum(this.object, this._sKey_, (nu !== undefined));
			}
			if (old && old.__id__ && (old._kind_ === 'object')) {
				assignments = old._assignments_;
				assignments._postponed_ += 1;
				postponed = [assignments];
				old._assignments_._delete(this);
			}
			if (nu && nu.__id__ && (nu._kind_ === 'object')) {
				assignments = nu._assignments_;
				assignments._postponed_ += 1;
				if (!postponed) postponed = [assignments];
				else postponed.push(assignments);
				nu._assignments_._add(this);
			}
			if (old === undefined) old = this._resolveValueValue_();
			if (nu === undefined) delete this._value_;
			else if (has) this._value_ = nu;
			else defineProperty(this, '_value_', d('cw', nu));
			nu = this._resolveValueValue_();
			if (nu === old) return;
			db._release_(this._emitValue_(this.object, nu, old,
				dbEvent, postponed));
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
