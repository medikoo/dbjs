'use strict';

var isDate         = require('es5-ext/date/is-date')
  , isRegExp       = require('es5-ext/reg-exp/is-reg-exp')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , unserialize    = require('../unserialize/key')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , getPrototypeOf = Object.getPrototypeOf
  , defineProperties = Object.defineProperties;

var normalizeKey = function (key, db) {
	if (key == null) return key;
	if (typeof key === 'function') {
		if (hasOwnProperty.call(key, '__id__')) return key;
		return db.Function.normalize(key);
	}
	if (typeof key === 'object') {
		if (hasOwnProperty.call(key, '__id__')) return key;
		if (isDate(key)) return db.DateTime.normalize(key);
		if (isRegExp(key)) return db.RegExp.normalize(key);
	}
	return key;
};

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
			var item, id = obj.__id__ + '/' + pSKey + '*' + sKey;
			if (!obj._keys_[pSKey]) obj._serialize_(unserialize(pSKey, db.objects));
			item = createObj(this, id, id, obj);
			setData[sKey] = item;
			defineProperties(item, {
				key: d('', normalizeKey(key, db)),
				_pSKey_: d('', pSKey),
				_sKey_: d('', sKey),
				_create_: d(itemCreate)
			});
			return inject(obj, pSKey, sKey, item, this);
		})
	});
};
