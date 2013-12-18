'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , Observable     = require('observable-value/value')
  , proto          = require('../_observable')

  , defineProperties = Object.defineProperties
  , valueDesc = Object.getOwnPropertyDescriptor(Observable.prototype, 'value')
  , ObservableValue;

ObservableValue = module.exports = function (object, pKey, sKey, key) {
	var data, value;
	defineProperties(this, {
		object: d('', object),
		key: d('', key),
		__pKey__: d('', pKey),
		__sKey__: d('', sKey),
		__dbId__: d('', object.__id__ + '/' + pKey + '*' + sKey)
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
		var set = this.object._getMultiple_(this.__pKey__);
		if (value) set.add(this.key);
		else set.delete(this.key);
	}),
	lastModified: d.gs(function () {
		var data, item;
		if (this.__lastModified__ == null) {
			data = this.object.__multiples__[this.__pKey__];
			if (data) item = data[this.__sKey__];
			this.__lastModified__ = item ? item.lastModified : 0;
		}
		return this.__lastModified__;
	}),
	getDescriptor: d(function () {
		var data = this.object.__multiples__[this.__pKey__];
		if (!data) return this.object.__itemPrototype__;
		return data[this.__sKey__] || this.object.__itemPrototype__;
	})
});
