'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , unserialize    = require('../unserialize/key')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , getPrototypeOf = Object.getPrototypeOf
  , defineProperties = Object.defineProperties;

var inject = function (obj, pSKey, sKey, proto, base) {
	if (!obj.hasOwnProperty('__descendants__')) return proto;
	obj.__descendants__._plainForEach_(function (obj) {
		var data, item, oldProto;
		if (obj.hasOwnProperty('__multiples__')) {
			if (hasOwnProperty.call(obj.__multiples__, pSKey)) {
				data = obj.__multiples__[pSKey];
				if (hasOwnProperty.call(data, sKey)) {
					item = data[sKey];
					oldProto = getPrototypeOf(item);
					setPrototypeOf(item, proto);
					oldProto.__descendants__._delete(item);
					proto._descendants_._add(item);
					return;
				}
			}
		}
		inject(obj, pSKey, sKey, proto, base);
	});
	return proto;
};

module.exports = function (db, item, createObj) {
	var itemCreate;

	itemCreate = function (obj, setData) {
		var id = obj.__id__ + '/' + this._pSKey_ + '*' + this._sKey_
		  , item = createObj(this, id, id, obj);
		setData[this._sKey_] = item;
		return inject(obj, this._pSKey_, this._sKey_, item, this);
	};

	item = defineProperties(item, {
		key: d('', undefined),
		_pSKey_: d('', ''),
		_value_: d('', undefined),
		_sKey_: d('', ''),
		_create_: d(function (obj, pSKey, key, sKey, setData) {
			var item, id = obj.__id__ + '/' + pSKey + '*' + sKey, normalizedKey
			  , descriptor = obj._getDescriptor_(pSKey);
			if (!obj._keys_[pSKey]) obj._serialize_(unserialize(pSKey, db.objects));
			item = createObj(this, id, id, obj);
			setData[sKey] = item;
			normalizedKey = descriptor._normalizeValue_(key);
			if (normalizedKey == null) {
				normalizedKey = descriptor.type.normalize(key);
			}
			if (normalizedKey != null) key = normalizedKey;
			defineProperties(item, {
				key: d('', key),
				_pSKey_: d('', pSKey),
				_sKey_: d('', sKey),
				_create_: d(itemCreate)
			});
			return inject(obj, pSKey, sKey, item, this);
		})
	});
};
