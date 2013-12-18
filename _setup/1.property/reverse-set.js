'use strict';

var setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d/d')
  , Set              = require('es6-set/polyfill')
  , notifyProperty   = require('../notify/property')
  , DbjsError        = require('../error')
  , defineObservable = require('../utils/define-set-observable')

  , create = Object.create, defineProperties = Object.defineProperties
  , ReverseSet;

ReverseSet = module.exports = function (key, sKey, descriptor) {
	Set.call(this);
	defineProperties(this, {
		__key__: d('', key),
		__sKey__: d('', sKey),
		__descriptor__: d('', descriptor),
		__isObjectKey__: d('', sKey[0] === '7'),
		__lastModifiedMap__: d('', create(null)),
		__lastEventMap__: d('', create(null))
	});
};
setPrototypeOf(ReverseSet, Set);

ReverseSet.prototype = Object.create(Set.prototype, {
	constructor: d(ReverseSet),
	add: d(function (obj) {
		var desc, sKey, rDesc;
		this._assertReverse_();
		desc = this.__descriptor__;
		desc.object.constructor.validate(obj);
		sKey = desc._sKey_;
		rDesc = obj._getDescriptor_(sKey);
		if (rDesc.multiple) {
			obj._multipleAdd_(sKey, obj._validateMultipleAdd_(sKey, this.__key__),
				this.__sKey__);
			return this;
		}
		obj._set_(sKey, obj._validateSet_(sKey, this.__key__));
		return this;
	}),
	clear: d(function () {
		var desc, sKey, reverse, calls;
		this._assertReverse_();
		desc = this.__descriptor__;
		sKey = desc._sKey_;
		reverse = this.__key__;
		calls = this.__setData__.map(function (obj) {
			var rDesc = obj._getDescriptor_(sKey);
			if (rDesc.multiple) {
				return obj._multipleDelete_.bind(obj, sKey,
					obj._validateMultipleDelete_(sKey, reverse),  this.__sKey__);
			}
			return obj._delete_.bind(obj, obj._validateDelete_(sKey));
		});
		desc.database._postponed_ += 1;
		calls.forEach(function (fn) { fn(); });
		desc.database._postponed_ -= 1;
	}),
	delete: d(function (obj) {
		var desc, sKey, rDesc;
		this._assertReverse_();
		if (!this.has(obj)) return false;
		desc = this.__descriptor__;
		sKey = desc._sKey_;
		rDesc = obj._getDescriptor_(sKey);
		if (rDesc.multiple) {
			obj._multipleDelete_(sKey,
				obj._validateMultipleDelete_(sKey, this.__key__),
				'7' + this.__key__.__id__);
		} else {
			obj._delete_(obj._validateDelete_(sKey));
		}
		return true;
	}),
	_assertReverse_: d(function () {
		if (this.__descriptor__.reverse === undefined) {
			throw new DbjsError("Reverse not configured for given property",
				'NON_REVERSE');
		}
		if (this.__descriptor__.unique) {
			throw new DbjsError("Reverse property is not multiple",
				'NON_MULTIPLE_REVERSE');
		}
	}),
	_add_: d(function (obj, dbEvent, postponed, init) {
		var lmData = this.__lastModifiedMap__, data = this.__setData__
		  , l = data.length, i = l, lm = dbEvent ? dbEvent.stamp : 0, old;
		lmData[obj.__id__] = lm;
		if (dbEvent) this.__lastEventMap__[obj.__id__] = dbEvent;
		while (i) {
			if (lmData[data[i - 1].__id__] <= lm) break;
			--i;
		}
		if (i === l) this.__setData__.push(obj);
		else this.__setData__.splice(i, 0, obj);
		if (init) return postponed;
		this.emit('_add', i, obj);
		if (this.__isObjectKey__ && (this.__descriptor__.reverse !== undefined) &&
				this.__descriptor__.unique && (i === l)) {
			old = (i === 0) ? undefined : data[i - 1];
			postponed = notifyProperty(this.__key__,
				this.__key__._serialize_(this.__descriptor__.reverse), obj, old,
				null, null, dbEvent, postponed);
		}
		if (!this.__isObservable__) return postponed;
		this._emitAdd_(obj, dbEvent);
		return postponed;
	}),
	_delete_: d(function (obj, dbEvent, postponed) {
		var i = this.__setData__.indexOf(obj), nu;
		this.__setData__.splice(i, 1);
		this.emit('_delete', i, obj);
		if (this.__isObjectKey__ && (this.__descriptor__.reverse !== undefined) &&
				this.__descriptor__.unique && (i === this.__setData__.length)) {
			nu = (i === 0) ? undefined : this.__setData__[i - 1];
			postponed = notifyProperty(this.__key__,
				this.__key__._serialize_(this.__descriptor__.reverse), nu, obj,
				null, null, dbEvent, postponed);
		}
		if (!this.__isObservable__) return postponed;
		this._emitDelete_(obj, dbEvent);
		return postponed;
	}),
	last: d.gs(function () {
		var data = this.__setData__, i = data.length;
		return i ? data[i - 1] : undefined;
	}),
	lastEvent: d.gs(function () {
		var last = this.last;
		if (!last) return null;
		return this.__lastEventMap__[last.__id__] || null;
	})
});

defineObservable(ReverseSet.prototype);
