'use strict';

var assign          = require('es5-ext/object/assign')
  , callable        = require('es5-ext/object/valid-callable')
  , d               = require('d/d')
  , lazy            = require('d/lazy')
  , injectPrimitive = require('../utils/inject-primitive')
  , DbjsError       = require('../error')
  , Observable      = require('./observable')

  , call = Function.prototype.call
  , hasOwnProperty = Object.prototype.hasOwnProperty, keys = Object.keys
  , create = Object.create, defineProperties = Object.defineProperties;

module.exports = function (object, descriptor, property) {
	defineProperties(object, assign({
		// Descriptor
		_getDpDescriptor_: d(function (pSKey, key) {
			return this._getDescriptor_(pSKey)._getDescriptor_(key);
		}),
		_getOwnDpDescriptor_: d(function (pSKey, key) {
			return this._getOwnDescriptor_(pSKey)._getOwnDescriptor_(key);
		}),

		// Observable
		_getDpObservable_: d(function (pSKey, sKey) {
			var observables = this._observableDescriptorProperties_;
			if (observables[pSKey]) observables = observables[pSKey];
			else observables = observables[pSKey] = create(null);
			if (observables[sKey]) return observables[sKey];
			return (observables[sKey] = new Observable(this, pSKey, sKey));
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
		_getOwnDescriptor_: d(function (key) {
			if (this.hasOwnProperty('__descriptors__')) {
				if (hasOwnProperty.call(this.__descriptors__, key)) {
					return this.__descriptors__[key];
				}
			}
			if (this.__descriptors__[key]) {
				return this.__descriptors__[key]._create_(this);
			}
			return property._create_(this, key);
		}),
		$getOwn: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid property name",
					'INVALID_PROPERTY_NAME');
			}
			return this._getOwnDescriptor_(sKey);
		}),
		_getDescriptor_: d(function (key) {
			return this.__descriptors__[key] || this.__descriptorPrototype__;
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
			return this.object._getDpObservable_(this._sKey_, sKey);
		}),
		_get: d(function (key) {
			var sKey = this._serialize(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid property name",
					'INVALID_PROPERTY_NAME');
			}
			return this._getObservable_(sKey);
		}),

		_forEachOwnDescriptor_: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1];
			callable(cb);
			if (!this.hasOwnProperty('__descriptors__')) return;
			keys(this.__descriptors__).forEach(function (sKey) {
				call.call(cb, thisArg, this[sKey], sKey);
			}, this.__descriptors__);
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
