'use strict';

var d      = require('d/d')
  , notify = require('../notify/desc-property')
  , Event  = require('../event')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , notifyDescs, notifyNamedDescs, notifyNamedDescsObj;

notifyDescs = function (obj, pKey, key, nu, old, dbEvent, sideNotify,
	postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		var desc;
		if (obj.hasOwnProperty('__descriptors__')) {
			if (hasOwnProperty.call(obj.__descriptors__, pKey)) {
				desc = obj.__descriptors__[pKey];
				if (desc.hasOwnProperty('__descriptors__')) {
					if (hasOwnProperty.call(desc.__descriptors__, key)) {
						if (desc.__descriptors__[key].hasOwnProperty('_value_')) return;
					}
				}
			}
		}
		postponed = notify(obj, pKey, key, nu, old, dbEvent, postponed);
		if (sideNotify) {
			postponed = sideNotify(obj, pKey, key, nu, old, dbEvent, postponed);
		}
		postponed = notifyDescs(obj, pKey, key, nu, old, dbEvent,
			sideNotify, postponed);
	});
	return postponed;
};

notifyNamedDescsObj = function (obj, key, nu, old, dbEvent, sidNfy, postponed) {
	if (obj.hasOwnProperty('__descriptorPrototype__')) {
		return notifyNamedDescs(obj.__descriptorPrototype__, key, nu, old, dbEvent,
			sidNfy, postponed);
	}
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = notifyNamedDescsObj(obj, key, nu, old, dbEvent, sidNfy,
			postponed);
	});
	return postponed;
};

notifyNamedDescs = function (descP, key, nu, old, dbEvent, sidNfy, postponed) {
	if (!descP.hasOwnProperty('__descendants__')) return postponed;
	descP.__descendants__._plainForEach_(function (desc) {
		var obj;
		if (!desc._sKey_) {
			postponed = notifyNamedDescs(desc, key, nu, old, dbEvent,
				sidNfy, postponed);
			return;
		}
		obj = desc.object;
		postponed = notify(obj, desc._sKey_, key, nu, old, dbEvent, postponed);
		if (sidNfy) {
			postponed = sidNfy(obj, desc._sKey_, key, nu, old, dbEvent, postponed);
		}
		postponed = notifyDescs(obj, desc._sKey_, key, nu, old, dbEvent,
			sidNfy, postponed);
	});
	return postponed;
};

module.exports = function (db, property) {
	defineProperties(property, {
		_destroy_: d(function () {
			if (!this.hasOwnProperty('_value_')) return;
			new Event(this); //jslint: skip
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old, has = this.hasOwnProperty('_value_'), obj;
			old = has ? this._value_ : undefined;
			if (nu === old) return;
			if ((nu === undefined) || (old === undefined)) {
				obj = this.object;
				if (obj.hasOwnProperty('__descriptors__')) {
					obj = obj.__descriptors__;
					if (hasOwnProperty.call(obj, this._pKey_)) {
						obj = obj[this._pKey_];
						if (nu === undefined) {
							if (obj.hasOwnProperty(this._sKey_)) delete obj[this._sKey_];
						} else if (!obj.hasOwnProperty(this._sKey_)) {
							defineProperty(obj, this._sKey_, obj._accessors_[this._sKey_]);
						}
					}
				}
			}
			old = this._value_;
			if (old != null) old = this.type.normalize(old);
			if (nu === undefined) delete this._value_;
			else if (has) this._value_ = nu;
			else defineProperty(this, '_value_', d('cw', nu));
			nu = this._value_;
			if (nu != null) nu = this.type.normalize(nu);
			if (nu === old) return;
			db._release_(this._emitValue_(this.object, nu, old, dbEvent));
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			postponed = notify(obj, this._pKey_, this._sKey_, nu, old, dbEvent,
				postponed);
			if (this._sideNotify_) {
				postponed = this._sideNotify_(obj, this._pKey_, this._sKey_, nu, old,
					dbEvent, postponed);
			}
			postponed = notifyDescs(obj, this._pKey_, this._sKey_, nu, old, dbEvent,
				this._sideNotify_, postponed);
			if (this._pKey_) return postponed;
			return notifyNamedDescsObj(obj, this._sKey_, nu, old, dbEvent,
				this._sideNotify_, postponed);
		})
	});
};
