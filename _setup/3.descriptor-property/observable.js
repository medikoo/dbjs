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

ObservableValue = module.exports = function (object, pSKey, key) {
	var desc, prop;
	defineProperties(this, {
		object: d('', object),
		key: d('', key),
		dbId: d('', object.__id__ + '$' + pSKey + '/' + key),
		__pSKey__: d('', pSKey)
	});
	desc = object._getDescriptor_(pSKey);
	prop = desc.__descriptors__[key];
	Observable.call(this, prop ? prop._resolveValue_() : undefined);
};
setPrototypeOf(ObservableValue, Observable);

ObservableValue.prototype = Object.create(proto, assign({
	constructor: d(ObservableValue),
	dbKind: d('observableDescriptorProperty'),
	value: d.gs('', valueDesc.get, function (value) {
		var desc = this.object._getOwnDescriptor_(this.__pSKey__);
		desc._set_(this.key, desc._validateSet_(this.key, value));
	}),
	lastModified: d.gs(function () {
		var desc, prop;
		if (this.__lastModified__ == null) {
			desc = this.object._getDescriptor_(this.__pSKey__);
			prop = desc.__descriptors__[this.key];
			this.__lastModified__ = prop ? prop.lastModified : 0;
		}
		return this.__lastModified__;
	}),
	descriptor: d.gs(function () {
		return this.object._getDpDescriptor_(this.__pSKey__, this.key);
	})
}, lazy({
	ownDescriptor: d(function () {
		var desc = this.object._getOwnDpDescriptor_(this.__pSKey__, this.key);
		defineProperty(this, 'descriptor', d('', desc));
		return desc;
	}, { desc: '' })
})));
