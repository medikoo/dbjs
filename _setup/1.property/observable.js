'use strict';

var assign         = require('es5-ext/object/assign')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , lazy           = require('d/lazy')
  , Observable     = require('observable-value')
  , ReadOnly       = require('observable-value/create-read-only')(Observable)
  , proto          = require('../_observable')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , valueDesc = Object.getOwnPropertyDescriptor(Observable.prototype, 'value')
  , getValue = valueDesc.get
  , ObservableProperty;

module.exports = ObservableProperty = function (object, sKey) {
	var getter = object._resolveGetter_(sKey);
	defineProperties(this, {
		object: d('', object),
		key: d('', object._keys_[sKey]),
		dbId: d('', object.__id__ + '/' + sKey),
		__sKey__: d('', sKey)
	});
	Observable.call(this, getter ? object._getDynamicValue_(sKey).resolvedValue :
			object._resolve_(sKey));
	object._observableProperties_[sKey] = this;
};
setPrototypeOf(ObservableProperty, Observable);

ObservableProperty.prototype = Object.create(proto, assign({
	constructor: d(ObservableProperty),
	dbKind: d('observableProperty'),
	value: d.gs('', function () {
		if (!this.object.__prototypeTurnInProgress__) return getValue.call(this);
		return this.object._resolve_(this.__sKey__);
	}, function (value) {
		var object = this.object, sKey = this.__sKey__;
		object._set_(sKey, object._validateSet_(sKey, value));
	}),
	lastModified: d.gs(function () {
		if (this.__lastModified__ == null) {
			this.__lastModified__ =
				this.object._getPropertyLastModified_(this.__sKey__);
		}
		return this.__lastModified__;
	}),
	descriptor: d.gs(function () {
		return this.object._getDescriptor_(this.__sKey__);
	})
}, lazy({
	ownDescriptor: d(function () {
		var desc = this.object._getOwnDescriptor_(this.__sKey__);
		defineProperty(this, 'descriptor', d('', desc));
		return desc;
	}, { desc: '' }),
	_lastModified: d(function () {
		var observable = new ReadOnly(this.lastModified);
		this.on('change', function () {
			observable._setValue(this.__lastModified__);
		});
		return observable;
	})
})));
