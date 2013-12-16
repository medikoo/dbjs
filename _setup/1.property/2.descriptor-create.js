'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , getIdent       = require('../utils/get-ident')
  , propagateProto = require('../utils/propagate-prototype-turn').descriptor

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , keys = Object.keys, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , injectProto, inject, expose;

expose = function (obj, descriptor, sKey) {
	var accessor = obj._accessors_[sKey];
	if (!accessor) return;
	if (descriptor._reverse_) {
		if (descriptor._reverse_.has(obj)) {
			defineProperty(obj, obj._keys_[sKey], accessor);
		}
		return;
	}
	if (!descriptor.nested && !descriptor.multiple) return;
	defineProperty(obj, obj._keys_[sKey], accessor);
};

injectProto = function (obj, proto, base) {
	if (obj.hasOwnProperty('__descriptors__')) {
		keys(obj.__descriptors__).forEach(function (sKey) {
			var descriptor = this[sKey], oldProto = getPrototypeOf(descriptor);
			if (oldProto !== base) return;
			setPrototypeOf(descriptor, proto);
			oldProto.__descendants__._delete(descriptor);
			proto._descendants_._add(descriptor);
		}, obj.__descriptors__);
	}
	if (!obj.hasOwnProperty('__descendants__')) return proto;
	obj.__descendants__._plainForEach_(function (obj) {
		var descProto, oldProto;
		if (obj.hasOwnProperty('__descriptorPrototype__')) {
			descProto = obj.__descriptorPrototype__;
			oldProto = getPrototypeOf(descProto);
			setPrototypeOf(descProto, proto);
			oldProto.__descendants__._delete(descProto);
			proto._descendants_._add(descProto);
			return;
		}
		injectProto(obj, proto, base);
	});
	return proto;
};

inject = function (obj, proto, base, dbEvent, postponed) {
	var sKey;
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	sKey = proto._sKey_;
	obj.__descendants__._plainForEach_(function (obj) {
		var oldProto, descriptor;
		if (obj.hasOwnProperty('__descriptors__') &&
				hasOwnProperty.call(obj.__descriptors__, sKey)) {
			descriptor = obj.__descriptors__[sKey];
			oldProto = getPrototypeOf(descriptor);
			if (oldProto !== base) {
				postponed = propagateProto(descriptor, proto, dbEvent, postponed);
				return;
			}
			setPrototypeOf(descriptor, proto);
			oldProto.__descendants__._delete(descriptor);
			proto._descendants_._add(descriptor);
			return;
		}
		postponed = inject(obj, proto, base, dbEvent, postponed);
	});
	return postponed;
};

module.exports = function (db, createObj, descriptor) {
	var descriptorCreate;

	descriptorCreate = function (obj) {
		var descriptor = createObj(this, obj.__id__ + '$' + this._ident_, obj);
		if (!this._writable_ && this._extensible_) {
			defineProperty(obj, '_writable_', d('c', true));
		}
		obj._descriptors_[this._sKey_] = descriptor;
		inject(obj, descriptor, this);
		expose(obj, descriptor, this._sKey_);
		return descriptor;
	};

	defineProperties(descriptor, {
		_sKey_: d('', ''),
		_ident_: d('', ''),
		_writable_: d('', false),
		_extensible_: d('c', true),
		_create_: d(function (obj) {
			var descriptorProto = createObj(this, obj.__id__ + '$', obj);
			defineProperty(obj, '__descriptorPrototype__', d('', descriptorProto));
			return injectProto(obj, descriptorProto, this);
		}),
		_createDescriptor_: d(function (obj, sKey, dbEvent) {
			var ident = sKey ? getIdent(obj._keys_[sKey], sKey) : ''
			  , descriptor = createObj(this, obj.__id__ + '$' + ident, obj)
			  , postponed, props;
			obj._descriptors_[sKey] = descriptor;
			props = {
				_sKey_: d('', sKey),
				_ident_: d('', ident),
				_create_: d(descriptorCreate),
				_value_: d('cw', undefined)
			};
			if (!this._writable_ && this._extensible_) {
				props._writable_ = d('c', true);
			}
			defineProperties(descriptor, props);
			postponed = inject(obj, descriptor, this, dbEvent);
			expose(obj, descriptor, sKey);
			if (postponed) db._release_(postponed);
			return descriptor;
		})
	});
};
