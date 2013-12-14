'use strict';

var assign          = require('es5-ext/object/assign')
  , d               = require('d/d')
  , lazy            = require('d/lazy')
  , injectPrimitive = require('../utils/inject-primitive')
  , DbjsError       = require('../error')
  , Observable      = require('./observable')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , create = Object.create, defineProperties = Object.defineProperties;

module.exports = function (object, descriptor, property) {
	defineProperties(object, assign({
		// Observable
		_getDescriptorPropertyObservable_: d(function (pKey, sKey) {
			var observables = this._observableDescriptorProperties_;
			if (observables[pKey]) observables = observables[pKey];
			else observables = observables[pKey] = create(null);
			if (observables[sKey]) return observables[sKey];
			return (observables[sKey] = new Observable(this, pKey, sKey));
		}),

		// Iterator
		_getDescriptorIterators_: d(function (sKey) {
			var iterators = this._descriptorIterators_;
			if (hasOwnProperty.call(iterators, sKey)) return iterators[sKey];
			return (iterators[sKey] = []);
		})
	}, lazy({
		// Observable
		_observableDescriptorProperties_: d(function () { return create(null); },
			{ cacheName: '__observableDescriptorProperties__', desc: '' }),

		// Iterator
		_descriptorIterators_: d(function () { return create(null); },
			{ cacheName: '__descriptorIterators__', desc: '' })
	})));

	defineProperties(descriptor, assign({
		// Descriptor
		__descriptorPrototype__: d('', property),
		__descriptors__: d('', create(null)),
		_getCurrentDescriptor_: d(function (key) {
			if (!(key in this)) return undefined;
			if (this[key] !== this._get_(key)) return null;
			return this.__descriptors__[key] || null;
		}),
		_getDescriptor_: d(function (sKey) {
			if (this.hasOwnProperty('__descriptors__')) {
				if (hasOwnProperty.call(this.__descriptors__, sKey)) {
					return this.__descriptors__[sKey];
				}
			}
			if (this.__descriptors__[sKey]) {
				return this.__descriptors__[sKey]._create_(this);
			}
			return property._create_(this, sKey);
		}),
		$get: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid property name",
					'INVALID_PROPERTY_NAME');
			}
			return this._getDescriptor_(sKey);
		}),

		// Observable
		_getObservable_: d(function (sKey) {
			return this.__object__
				._getDescriptorPropertyObservable_(this._sKey_, sKey);
		}),
		_get: d(function (key) {
			var sKey = this._serialize(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid property name",
					'INVALID_PROPERTY_NAME');
			}
			return this._getObservable_(sKey);
		})
	}, lazy({
		// Descriptor
		_descriptors_: d(function () {
			return injectPrimitive(this, create(this.__descriptors__),
				'__descriptors__');
		}, { cacheName: '__descriptors__', desc: '' }),

		// Observable
		_dynamicListeners_: d(function () { return []; },
			{ cacheName: '__dynamicListeners__', desc: '' })
	})));
};
