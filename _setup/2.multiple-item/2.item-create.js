'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , getIdent       = require('../utils/get-ident')
  , unserialize    = require('../unserialize/value')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , getPrototypeOf = Object.getPrototypeOf
  , defineProperties = Object.defineProperties

  , inject;

inject = function (obj, pKey, sKey, proto, base) {
	if (!obj.hasOwnProperty('__descendants__')) return proto;
	obj.__descendants__._plainForEach_(function (obj) {
		var data, item, oldProto;
		if (obj.hasOwnProperty('__multiples__')) {
			if (hasOwnProperty.call(obj.__multiples__, pKey)) {
				data = obj.__multiples__[pKey];
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
		inject(obj, pKey, sKey, proto, base);
	});
	return proto;
};

module.exports = function (db, item, createObj) {
	var itemCreate;

	itemCreate = function (obj, setData) {
		var item = createObj(this, obj.__id__ + '/' + this._ident_, obj);
		setData[this._sKey_] = item;
		return inject(obj, this._pKey_, this._sKey_, item, this);
	};

	item = defineProperties(item, {
		_pKey_: d('', ''),
		_key_: d('', undefined),
		_value_: d('', undefined),
		_sKey_: d('', ''),
		_ident_: d('', '*'),
		_create_: d(function (obj, pKey, key, sKey, setData) {
			var pIdent, ident, item;
			if (!obj._keys_[pKey]) obj._serialize_(unserialize(pKey, db.objects));
			pIdent = getIdent(obj._keys_[pKey], pKey);
			ident = pIdent + '*' + getIdent(key, sKey);
			item = createObj(this, obj.__id__ + '/' + ident, obj);
			setData[sKey] = item;
			defineProperties(item, {
				_pKey_: d('', pKey),
				_pIdent_: d('', pIdent),
				_ident_: d('', ident),
				_key_: d('', key),
				_sKey_: d('', sKey),
				_create_: d(itemCreate)
			});
			return inject(obj, pKey, sKey, item, this);
		})
	});
};
