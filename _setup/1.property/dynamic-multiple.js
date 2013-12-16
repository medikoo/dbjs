'use strict';

var assign           = require('es5-ext/object/assign')
  , eq               = require('es5-ext/object/eq')
  , setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , forOf            = require('es6-iterator/for-of')
  , isIterable       = require('es6-iterator/is-iterable')
  , d                = require('d/d')
  , lazy             = require('d/lazy')
  , Set              = require('observable-set/create-read-only')(
	require('es6-set/polyfill')
)
  , ReadOnly         = require('observable-set/create-read-only')(
	require('es6-set/primitive')
)
  , defineObservable = require('../utils/define-set-observable')
  , observePass      = require('../utils/observe-pass-through')
  , serialize        = require('../utils/serialize')

  , forEach = Array.prototype.forEach
  , create = Object.create, defineProperties = Object.defineProperties
  , Multiple;

Multiple = module.exports = function (object, sKey, getter) {
	var iterate, desc, value;
	if (!(this instanceof Multiple)) return new Multiple(object, sKey);
	Set.call(this);
	defineProperties(this, {
		__object__: d('', object),
		__sKey__: d('', sKey)
	});
	if (!getter) return;
	value = getter.call(object, observePass);
	if (value == null) return;
	desc = object.__descriptors__[sKey] || object.__descriptorPrototype__;
	iterate = function (value) {
		if (value == null) return;
		value = desc._normalizeValue_(value);
		if (value == null) return;
		if (this.eIndexOf(value) !== -1) return;
		this.push(value);
	};
	if (isIterable(value)) forOf(value, iterate, this.__setData__);
	else forEach.call(value, iterate, this.__setData__);
};
setPrototypeOf(Multiple, Set);

Multiple.prototype = create(Set.prototype, assign({
	constructor: d(Multiple),
	_doClear_: d(function (dbEvent) {
		var event;
		if (!this.__isObservable__) {
			this._clear();
			return;
		}
		if (!this.__postponed__) {
			this._clear();
			this.emit('change', { type: 'clear', dbjs: dbEvent });
			return;
		}
		event = this.__postponedEvent__;
		if (!event) {
			event = this.__postponedEvent__ =
				{ deleted: new ReadOnly(this, serialize) };
		} else {
			this.forEach(function (value) {
				if (event.added && event.added.has(value)) {
					event.added._delete(value);
					return;
				}
				if (!event.deleted) event.deleted = new ReadOnly(null, serialize);
				event.deleted._add(value);
			}, this);
		}
		if (dbEvent) event.dbjs = dbEvent;
		this._clear();
	}),
	_noteAdd_: d(function (value) {
		var event = this.__postponedEvent__;
		if (!event) event = this.__postponedEvent__ = {};
		if (event.deleted && event.deleted.has(value)) {
			event.deleted._delete(value);
			return;
		}
		if (!event.added) event.added = new ReadOnly(null, serialize);
		event.added._add(value);
	}),
	_noteDelete_: d(function (value) {
		var event = this.__postponedEvent__;
		if (!event) event = this.__postponedEvent__ = {};
		if (event.added && event.added.has(value)) {
			event.added._delete(value);
			return;
		}
		if (!event.deleted) event.deleted = new ReadOnly(null, serialize);
		event.deleted._add(value);
	}),
	_update_: d(function (value, dbEvent) {
		var index, setData, desc, iterate, l, isObservable;
		if (value == null) {
			if (!this.__size__) return;
			this._doClear_();
			return;
		}
		setData = this.__setData__;
		desc = this.__object__.__descriptors__[this.sKey] ||
			this.__object__.__descriptorPrototype__;
		index = 0;
		l = setData.length;
		isObservable = this.__isObservable__;
		if (isObservable) ++this._postponed_;
		iterate = function (value) {
			var i;
			if (value == null) return;
			value = desc._normalizeValue_(value);
			if (value == null) return;
			if (eq(setData[index], value)) {
				++index;
				return;
			}
			i = setData.eIndexOf(value);
			if (i === -1) {
				if (index === setData.length) setData.push(value);
				else setData.splice(index, 0, value);
				++l;
				this.emit('_add', index, value);
				if (isObservable) this._noteAdd_(value);
				++index;
				return;
			}
			if (i < index) return;
			setData.splice(i, 1);
			this.emit('_delete', i, value);
			setData.splice(index, 0, value);
			this.emit('_add', index, value);
			++index;
		};
		if (isIterable(value)) forOf(value, iterate, this);
		else forEach.call(value, iterate, this);
		if ((index === 0) && l) {
			if (isObservable) --this._postponed_;
			this._doClear_(dbEvent);
			return;
		}
		while (l > index) {
			value = setData.pop();
			this.emit('_delete', --l, value);
			if (isObservable) this._noteDelete_(value);
		}
		if (dbEvent && this.__postponedEvent__) {
			this.__postponedEvent__.dbjs = dbEvent;
		}
		if (isObservable) --this._postponed_;
	}),
	_updateGetter_: d(function (getter) {
		if (this.__isObservable__) return;
		this._update_(getter ? getter.call(this.__object__, observePass) : null);
	}),
	_triggerObservable_: d(function () {
		var dynamicValue, desc;
		dynamicValue = this.__object__._getDynamicValue_(this.__sKey__);
		if (dynamicValue.value === null) {
			this._update_(null);
			return;
		}
		desc = this.__object__.__descriptors__[this.__sKey__] ||
			this.__object__.__descriptorPrototype__;
		if (!desc.multiple) return;
		this._update_(dynamicValue.value);
	})
}, lazy({
	_dynamicListeners_: d(function () { return []; },
		{ cacheName: '__dynamicListeners__', desc: '' })
})));
defineObservable(Multiple.prototype, Multiple.prototype._triggerObservable_);