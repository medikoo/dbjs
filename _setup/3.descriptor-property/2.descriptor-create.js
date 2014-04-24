'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , getPrototypeOf = Object.getPrototypeOf
  , defineProperties = Object.defineProperties

  , inject;

inject = function (obj, proto, base) {
	var sKey;
	if (!obj.hasOwnProperty('__descendants__')) return proto;
	sKey = proto.key;
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
		var id = descriptor.__id__ + '/' + this.key
		  , property = createObj(this, id, id, descriptor.object), props;
		if (descriptor._sKey_ !== property._pSKey_) {
			props = { _pSKey_: d('', descriptor._sKey_) };
		}
		if (!this._writable_ && this._extensible_) {
			if (!props) props = {};
			props._writable_ = d('c', true);
		}
		if (props) defineProperties(property, props);
		descriptor._descriptors_[this.key] = property;
		return inject(descriptor, property, this);
	};

	defineProperties(property, {
		key: d('', undefined),
		_pSKey_: d('', ''),
		_writable_: d('', false),
		_extensible_: d('c', true),
		_value_: d('', undefined),
		_create_: d(function (descriptor, key) {
			var id = descriptor.__id__ + '/' + key
			  , property = createObj(this, id, id, descriptor.object), props;
			descriptor._descriptors_[key] = property;
			props = {
				key: d('', key),
				_pSKey_: d('', descriptor._sKey_),
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
