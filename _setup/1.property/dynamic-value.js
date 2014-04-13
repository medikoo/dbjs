'use strict';

var assign          = require('es5-ext/object/assign')
  , d               = require('d/d')
  , autoBind        = require('d/auto-bind')
  , lazy            = require('d/lazy')
  , resolveTriggers = require('../utils/resolve-triggers')
  , notify          = require('../notify/property')

  , defineProperties = Object.defineProperties
  , DynamicValue, notifyMultiple;

notifyMultiple = function (obj, sKey, nu, dbEvent, postponed) {
	var data;
	// Dynamic multiple values
	if (obj.hasOwnProperty('__dynamicMultiples__')) {
		data = obj.__dynamicMultiples__[sKey];
		if (!data || !data.__isObservable__) return postponed;
		if (!postponed) postponed = [data];
		else postponed.push(data);
		data._postponed_ += 1;
		data._update_(nu, dbEvent);
	}
	return postponed;
};

DynamicValue = module.exports = function (object, sKey) {
	var desc, value;
	if (!(this instanceof DynamicValue)) return new DynamicValue(object, sKey);
	defineProperties(this, {
		object: d('', object),
		__sKey__: d('', sKey)
	});
	desc = object._getDescriptor_(sKey);
	value = desc._resolveValueGetter_();
	if (!value) return;
	this.__observer__ = resolveTriggers(this.object, value,
		this.__triggerObserverUpdate__);
	value = this.__observer__.getter.call(object);
	if (value == null) value = null;
	this.value = value;
	this.multiple = desc.multiple;
	if (!desc.multiple) {
		if (value !== null) value = desc._normalizeValue_(value);
		this.resolvedValue = value;
	} else {
		this.resolvedValue = object._getDynamicMultiple_(sKey, value);
	}
};

defineProperties(DynamicValue.prototype, assign({
	_updateObserver_: d(function (getter, dbEvent, other, postponed) {
		if (this.__observer__) {
			if (this.__observer__.origin === getter) return;
			this._clearObserver_();
		}
		if (!getter) {
			postponed = notify(this.object, this.__sKey__, other,
				this.resolvedValue, null, null, dbEvent, postponed);
			if (this.multiple) {
				postponed = notifyMultiple(this.object, this.__sKey__, undefined,
					dbEvent, postponed);
			}
			this.value = this.resolvedValue = this.multiple = undefined;
			return postponed;
		}
		this.__observer__ = resolveTriggers(this.object, getter,
			this.__triggerObserverUpdate__);
		return this._update_(this.__observer__.getter.call(this.object),
			dbEvent, other, postponed);
	}),
	_clearObserver_: d(function () {
		if (!this.__observer__) return;
		this.__observer__.clear();
		this.__observer__ = null;
	}),
	_update_: d(function (value, dbEvent, other, postponed) {
		var obj = this.object, desc = obj._getDescriptor_(this.__sKey__), old;
		if (value == null) value = null;
		if (desc.multiple) {
			if (this.value === undefined) {
				this.value = value;
				this.resolvedValue = obj._getDynamicMultiple_(this.__sKey__);
				this.multiple = true;
				postponed = notify(obj, this.__sKey__, this.resolvedValue,
					other, null, null, dbEvent, postponed);
			} else if (!this.multiple) {
				this.value = value;
				old = this.resolvedValue;
				this.resolvedValue = obj._getDynamicMultiple_(this.__sKey__);
				this.multiple = true;
				postponed = notify(obj, this.__sKey__, this.resolvedValue,
					old, null, null, dbEvent, postponed);
			}
			if (this.value === value) return postponed;
			this.value = value;
			return notifyMultiple(obj, this.__sKey__, value, dbEvent, postponed);
		}
		if (this.multiple) {
			this.multiple = false;
			postponed = notifyMultiple(obj, this.__sKey__, undefined,
				dbEvent, postponed);
		}
		this.value = value;
		if (value != null) value = desc._normalizeValue_(value);
		if (value == null) value = null;

		if (this.resolvedValue === value) return postponed;
		old = (this.resolvedValue !== undefined) ? this.resolvedValue : other;
		this.resolvedValue = value;
		return notify(obj, this.__sKey__, value, old, null, null,
			dbEvent, postponed);
	}),
	_triggerUpdate_: d(function () {
		var desc = this.object._getDescriptor_(this.__sKey__);
		this._updateObserver_(desc._resolveValueGetter_());
	})
}, autoBind({
	__triggerObserverUpdate__: d(function (event, postponed) {
		return this._update_(this.__observer__.getter.call(this.object),
			event, undefined, postponed);
	})
}), lazy({
	__observer__: d(function () { return null; }, { desc: 'w' })
})));
