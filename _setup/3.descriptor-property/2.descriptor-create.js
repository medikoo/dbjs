'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , getPrototypeOf = Object.getPrototypeOf
  , defineProperties = Object.defineProperties

  , inject;

inject = function (obj, proto, base) {
	var sKey;
	if (!obj.hasOwnProperty('__descendants__')) return proto;
	sKey = proto._sKey_;
	obj.__descendants__._plainForEach_(function (obj) {
		var desc, oldProto;
		if (obj.hasOwnProperty('__descriptors__') &&
				hasOwnProperty.call(obj.__descriptors__, sKey)) {
			desc = obj.__descriptors__[sKey];
			oldProto = getPrototypeOf(desc);
			setPrototypeOf(desc, proto);
			oldProto.__descendants__._delete(desc);
			proto._descendants_._add(desc);
			return;
		}
		inject(obj, proto, base);
	});
	return proto;
};

module.exports = function (property, createObj) {
	var propertyCreate;

	propertyCreate = function (descriptor) {
		var property = createObj(this, descriptor.__id__ + '/' + this._sKey_,
			descriptor.__master__), props;
		if (descriptor._sKey_ !== property._pKey_) {
			props = { _pKey_: d('', descriptor._sKey_) };
		}
		if (!this._writable_ && this._extensible_) {
			if (!props) props = {};
			props._writable_ = d('c', true);
		}
		if (props) defineProperties(property, props);
		descriptor._descriptors_[this._sKey_] = property;
		return inject(descriptor, property, this);
	};

	defineProperties(property, {
		_pKey_: d('', ''),
		_sKey_: d('', ''),
		_writable_: d('', false),
		_extensible_: d('c', true),
		_value_: d('', undefined),
		_create_: d(function (descriptor, key) {
			var property = createObj(this, descriptor.__id__ + '/' + key,
					descriptor.__master__), props;
			descriptor._descriptors_[key] = property;
			props = {
				_pKey_: d('', descriptor._sKey_),
				_sKey_: d('', key),
				_create_: d(propertyCreate)
			};
			if (!this._writable_ && this._extensible_) {
				props._writable_ = d('c', true);
			}
			defineProperties(property, props);
			return inject(descriptor, property, this);
		})
	});
};
