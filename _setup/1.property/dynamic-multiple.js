'use strict';

var eIndexOf         = require('es5-ext/array/#/e-index-of')
  , assign           = require('es5-ext/object/assign')
  , create           = require('es5-ext/object/create')
  , eq               = require('es5-ext/object/eq')
  , setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , forOf            = require('es6-iterator/for-of')
  , isIterable       = require('es6-iterator/is-iterable')
  , setGetFirst      = require('es6-set/ext/get-first')
  , setGetLast       = require('es6-set/ext/get-last')
  , setCopy          = require('es6-set/ext/copy')
  , setEvery         = require('es6-set/ext/every')
  , setSome          = require('es6-set/ext/some')
  , d                = require('d')
  , lazy             = require('d/lazy')
  , Set              = require('observable-set/create-read-only')(
	require('es6-set/polyfill')
)
  , ReadOnly         = require('observable-set/create-read-only')(
	require('es6-set/primitive')
)
  , defineObservable = require('../utils/define-set-observable')
  , observePass      = require('../utils/observe-pass-through')
  , serialize        = require('../serialize/value')

  , forEach = Array.prototype.forEach
  , defineProperties = Object.defineProperties
  , Multiple;

Multiple = module.exports = function (object, sKey, value) {
	var iterate, desc, self;
	self = setPrototypeOf(new Set(), Multiple.prototype);
	defineProperties(self, {
		object: d('', object),
		dbId: d('', object.__id__ + '/' + sKey),
		__sKey__: d('', sKey)
	});
	if (value == null) return self;
	desc = object._getDescriptor_(sKey);
	iterate = function (value) {
		if (value == null) return;
		value = desc._normalizeValue_(value);
		if (value == null) return;
		if (eIndexOf.call(this, value) !== -1) return;
		this.push(value);
	};
	if (isIterable(value)) forOf(value, iterate, self.__setData__);
	else forEach.call(value, iterate, self.__setData__);
	return self;
};
setPrototypeOf(Multiple, Set);

Multiple.prototype = create(Set.prototype, assign({
	constructor: d(Multiple),
	first: d.gs(setGetFirst),
	last: d.gs(setGetLast),
	copy: d(setCopy),
	every: d(setEvery),
	some: d(setSome),
	_doClear_: d(function (dbEvent) {
		var event;
		if (!this.__isObservable__) {
			this._clear();
			return;
		}
		if (!this.__postponed__) {
			this._clear();
			this.emit('change', { type: 'clear', dbjs: dbEvent, target: this });
			return;
		}
		event = this.__postponedEvent__;
		if (!event) {
			event = this.__postponedEvent__ =
				{ deleted: new ReadOnly(this, serialize), target: this };
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
		if (!event) event = this.__postponedEvent__ = { target: this };
		if (event.deleted && event.deleted.has(value)) {
			event.deleted._delete(value);
			return;
		}
		if (!event.added) event.added = new ReadOnly(null, serialize);
		event.added._add(value);
	}),
	_noteDelete_: d(function (value) {
		var event = this.__postponedEvent__;
		if (!event) event = this.__postponedEvent__ = { target: this };
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
		desc = this.object.__descriptors__[this.sKey] ||
			this.object.__descriptorPrototype__;
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
			i = eIndexOf.call(setData, value);
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
		this._update_(getter ? getter.call(this.object, observePass) : null);
	}),
	_triggerObservable_: d(function () {
		var dynamicValue, desc;
		dynamicValue = this.object._getDynamicValue_(this.__sKey__);
		if (dynamicValue.value === null) {
			this._update_(null);
			return;
		}
		desc = this.object.__descriptors__[this.__sKey__] ||
			this.object.__descriptorPrototype__;
		if (!desc.multiple) return;
		this._update_(dynamicValue.value);
	})
}, lazy({
	_dynamicListeners_: d(function () { return []; },
		{ cacheName: '__dynamicListeners__', desc: '' })
})));
defineObservable(Multiple.prototype, Multiple.prototype._triggerObservable_);
