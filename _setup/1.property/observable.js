'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , Observable     = require('observable-value/value')
  , getIdent       = require('../utils/get-ident')
  , proto          = require('../_observable')

  , defineProperties = Object.defineProperties
  , valueDesc = Object.getOwnPropertyDescriptor(Observable.prototype, 'value')
  , ObservableProperty;

module.exports = ObservableProperty = function (object, sKey) {
	var getter = object._resolveGetter_(sKey);
	defineProperties(this, {
		__object__: d('', object),
		__sKey__: d('', sKey),
		__dbId__: d('', object.__id__ + '/' + getIdent(object._keys_[sKey], sKey))
	});
	Observable.call(this, getter ? object._getDynamicValue_(sKey).value :
			object._resolve_(sKey));
	object._observableProperties_[sKey] = this;
};
setPrototypeOf(ObservableProperty, Observable);

ObservableProperty.prototype = Object.create(proto, {
	constructor: d(ObservableProperty),
	value: d.gs('', valueDesc.get, function (value) {
		var object = this.__object__, sKey = this.__sKey__;
		object._set_(sKey, object._validateSet_(sKey, value));
	}),
	lastModified: d.gs(function () {
		if (this.__lastModified__ == null) {
			this.__lastModified__ =
				this.__object__._getPropertyLastModified_(this.__sKey__);
		}
		return this.__lastModified__;
	}),
	getDescriptor: d(function () {
		return this.__object__.__descriptors__[this.__sKey__] ||
			this.__object__.__descriptorPrototype__;
	})
});
