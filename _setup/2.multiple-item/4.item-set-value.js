'use strict';

var d          = require('d/d')
  , notifyItem = require('../notify/item')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , notify, notifyDescendants;

notify = function (obj, pKey, sKey, key, value, dbEvent, postponed) {
	if (obj._normalize_(pKey, key) == null) return postponed;
	return notifyItem(obj, pKey, sKey, key, value, null, dbEvent, postponed);
};

notifyDescendants = function (obj, pKey, sKey, key, value, dbEvent, postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		var data;
		if (obj.hasOwnProperty('__multiples__')) {
			if (hasOwnProperty.call(obj.__multiples__, pKey)) {
				data = obj.__multiples__[pKey];
				if (hasOwnProperty.call(data, sKey)) {
					if (data[sKey].hasOwnProperty('_value_')) return;
				}
			}
		}
		postponed = notify(obj, pKey, sKey, key, value, dbEvent, postponed);
		postponed = notifyDescendants(obj, pKey, sKey, key, value, dbEvent,
			postponed);
	});
	return postponed;
};

module.exports = function (db, item) {
	defineProperties(item, {
		_setValue_: d(function (nu, dbEvent) {
			var old, has = this.hasOwnProperty('_value_');
			old = has ? this._value_ : undefined;
			if (nu === old) return;
			if (this._key_.__id__ && (this._key_._kind_ === 'object')) {
				if (old) this._key_._assignments_._delete(this);
				else if (nu) this._key_._assignments_._add(this);
			}
			old = Boolean(this._value_);
			if (nu === undefined) delete this._value_;
			else if (has) this._value_ = nu;
			else defineProperty(this, '_value_', d('cw', nu));
			nu = Boolean(this._value_);
			if (nu === old) return;
			db._release_(this._emitValue_(this.__master__, nu, old, dbEvent));
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			postponed = notify(obj, this._pKey_, this._sKey_, this._key_,
				nu, dbEvent, postponed);
			return notifyDescendants(obj, this._pKey_, this._sKey_,
				this._key_, nu, dbEvent, postponed);
		})
	});
};
