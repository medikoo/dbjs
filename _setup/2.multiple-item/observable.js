'use strict';

var assign         = require('es5-ext/object/assign')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , lazy           = require('d/lazy')
  , Observable     = require('observable-value')
  , proto          = require('../_observable')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , valueDesc = Object.getOwnPropertyDescriptor(Observable.prototype, 'value')
  , ObservableValue;

ObservableValue = module.exports = function (object, pSKey, sKey, key) {
	var data, value;
	defineProperties(this, {
		object: d('', object),
		key: d('', key),
		dbId: d('', object.__id__ + '/' + pSKey + '*' + sKey),
		__pSKey__: d('', pSKey),
		__sKey__: d('', sKey)
	});
	data = object.__multiples__[pSKey];
	if (data) data = data[sKey];
	value = data ? Boolean(data._value_) : false;
	if (value && (object._normalize_(pSKey, key) == null)) value = false;
	Observable.call(this, value);
};
setPrototypeOf(ObservableValue, Observable);

ObservableValue.prototype = Object.create(proto, assign({
	constructor: d(ObservableValue),
	dbKind: d('observableMultipleItem'),
	value: d.gs('', valueDesc.get, function (value) {
		var set = this.object._getMultiple_(this.__pSKey__);
		if (value) set.add(this.key);
		else set.delete(this.key);
	}),
	lastModified: d.gs(function () {
		var data, item;
		if (this.__lastModified__ == null) {
			data = this.object.__multiples__[this.__pSKey__];
			if (data) item = data[this.__sKey__];
			this.__lastModified__ = item ? item.lastModified : 0;
		}
		return this.__lastModified__;
	}),
	descriptor: d.gs(function () {
		return this.object._getMultipleItem_(this.__pSKey__, this.__sKey__);
	})
}, lazy({
	ownDescriptor: d(function () {
		var desc = this.object._getOwnMultipleItem_(this.__pSKey__, this.key,
			this.__sKey__);
		defineProperty(this, 'descriptor', d('', desc));
		return desc;
	}, { desc: '' })
})));
