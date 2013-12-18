'use strict';

var d          = require('d/d')
  , notifyItem = require('../notify/item')
  , Event      = require('../event')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , notify, notifyDescendants;

notify = function (obj, pSKey, sKey, key, value, dbEvent, postponed) {
	if (obj._normalize_(pSKey, key) == null) return postponed;
	return notifyItem(obj, pSKey, sKey, key, value, null, dbEvent, postponed);
};

notifyDescendants = function (obj, pSKey, sKey, key, value, dbEv, postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		var data;
		if (obj.hasOwnProperty('__multiples__')) {
			if (hasOwnProperty.call(obj.__multiples__, pSKey)) {
				data = obj.__multiples__[pSKey];
				if (hasOwnProperty.call(data, sKey)) {
					if (data[sKey].hasOwnProperty('_value_')) return;
				}
			}
		}
		postponed = notify(obj, pSKey, sKey, key, value, dbEv, postponed);
		postponed = notifyDescendants(obj, pSKey, sKey, key, value, dbEv,
			postponed);
	});
	return postponed;
};

module.exports = function (db, item) {
	defineProperties(item, {
		_destroy_: d(function () {
			if (!this.hasOwnProperty('_value_')) return;
			new Event(this); //jslint: skip
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old, has = this.hasOwnProperty('_value_'), postponed, assignments;
			old = has ? this._value_ : undefined;
			if (nu === old) return;
			if (this.key.__id__ && (this.key._kind_ === 'object')) {
				if (old || nu) {
					assignments = this.key._assignments_;
					assignments._postponed_ += 1;
					postponed = [assignments];
					if (old) assignments._delete(this);
					else if (nu) this.key._assignments_._add(this);
				}
			}
			old = Boolean(this._value_);
			if (nu === undefined) delete this._value_;
			else if (has) this._value_ = nu;
			else defineProperty(this, '_value_', d('cw', nu));
			nu = Boolean(this._value_);
			if (nu === old) return;
			db._release_(this._emitValue_(this.object, nu, old,
				dbEvent, postponed));
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			postponed = notify(obj, this._pSKey_, this._sKey_, this.key,
				nu, dbEvent, postponed);
			return notifyDescendants(obj, this._pSKey_, this._sKey_,
				this.key, nu, dbEvent, postponed);
		})
	});
};
