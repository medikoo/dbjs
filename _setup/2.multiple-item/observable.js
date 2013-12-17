'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , Observable     = require('observable-value/value')
  , getIdent       = require('../utils/get-ident')
  , proto          = require('../_observable')

  , defineProperties = Object.defineProperties
  , valueDesc = Object.getOwnPropertyDescriptor(Observable.prototype, 'value')
  , ObservableValue;

ObservableValue = module.exports = function (object, pKey, sKey, key) {
	var data, value;
	defineProperties(this, {
		__object__: d('', object),
		__pKey__: d('', pKey),
		__sKey__: d('', sKey),
		__key__: d('', key),
		__dbId__: d('', object.__id__ + '/' + getIdent(object._keys_[pKey], pKey) +
			'*' + getIdent(key, sKey))
	});
	data = object.__multiples__[pKey];
	if (data) data = data[sKey];
	value = data ? Boolean(data._value_) : false;
	if (value && (object._normalize_(pKey, key) == null)) value = false;
	Observable.call(this, value);
};
setPrototypeOf(ObservableValue, Observable);

ObservableValue.prototype = Object.create(proto, {
	constructor: d(ObservableValue),
	value: d.gs('', valueDesc.get, function (value) {
		var set = this.__object__._getMultiple_(this.__pKey__);
		if (value) set.add(this._key_);
		else set.delete(this._key_);
	}),
	lastModified: d.gs(function () {
		var data, item;
		if (this.__lastModified__ == null) {
			data = this.__object__.__multiples__[this.__pKey__];
			if (data) item = data[this.__sKey__];
			this.__lastModified__ = item ? item.lastModified : 0;
		}
		return this.__lastModified__;
	}),
	getDescriptor: d(function () {
		var data = this.__object__.__multiples__[this.__pKey__];
		if (!data) return this.__object__.__itemPrototype__;
		return data[this.__sKey__] || this.__object__.__itemPrototype__;
	})
});
