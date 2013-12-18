'use strict';

var assign          = require('es5-ext/object/assign')
  , callable        = require('es5-ext/object/valid-callable')
  , d               = require('d/d')
  , lazy            = require('d/lazy')
  , injectPrimitive = require('../utils/inject-primitive')
  , DbjsError       = require('../error')
  , ObjectsSet      = require('../objects-set')
  , Observable      = require('./observable')
  , DynamicMultiple = require('./dynamic-multiple')
  , DynamicValue    = require('./dynamic-value')
  , ReverseMap      = require('./reverse-map')

  , call = Function.prototype.call
  , hasOwnProperty = Object.prototype.hasOwnProperty, keys = Object.keys
  , create = Object.create, defineProperties = Object.defineProperties;

module.exports = function (db, object, descriptor) {
	defineProperties(object, assign({
		// Descriptor
		__descriptorPrototype__: d('', descriptor),
		__descriptors__: d('', create(null)),
		_getCurrentDescriptor_: d(function (sKey) {
			var key = this._keys_[sKey];
			if (!(key in this)) return null;
			if (this[key] !== this._get_(sKey)) return null;
			return this.__descriptors__[sKey] || this.__descriptorPrototype__;
		}),
		_descriptorPrototype_: d.gs(function () {
			if (this.hasOwnProperty('__descriptorPrototype__')) {
				return this.__descriptorPrototype__;
			}
			return this.__descriptorPrototype__._create_(this);
		}),
		_getDescriptor_: d(function (sKey, dbEvent) {
			if (this.hasOwnProperty('__descriptors__')) {
				if (hasOwnProperty.call(this.__descriptors__, sKey)) {
					return this.__descriptors__[sKey];
				}
			}
			if (this.__descriptors__[sKey]) {
				return this.__descriptors__[sKey]._create_(this);
			}
			return this.__descriptorPrototype__
				._createDescriptor_(this, sKey, dbEvent);
		}),
		$getOwn: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			return this._getDescriptor_(sKey);
		}),

		// Nested object
		_getObject_: d(function (sKey) {
			var objects = this._objects_, desc, Type;
			if (objects[sKey]) return objects[sKey];
			desc = this.__descriptors__[sKey] || this.__descriptorPrototype__;
			Type = desc.type;
			if ((Type !== db.Base) && !db.isObjectType(Type)) Type = db.Base;
			return (objects[sKey] = Type._createNested_(this, sKey));
		}),

		// Observables
		_getObservable_: d(function (sKey) {
			var observables = this._observableProperties_;
			if (observables[sKey]) return observables[sKey];
			return (observables[sKey] = new Observable(this, sKey));
		}),
		_get: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			return this._getObservable_(sKey);
		}),

		// Reverse
		_getReverseMap_: d(function (sKey) {
			var maps = this._reverseMaps_;
			if (hasOwnProperty.call(maps, sKey)) return maps[sKey];
			return (maps[sKey] = new ReverseMap(this, sKey));
		}),

		// Dynamic multiple
		_getDynamicMultiple_: d(function (sKey) {
			var data = this._dynamicMultiples_;
			if (data[sKey]) return data[sKey];
			data[sKey] = new DynamicMultiple(this, sKey);
			return data[sKey];
		}),
		_resolveDynamicMultiple_: d(function (sKey, getter) {
			var data = this._dynamicMultiples_;
			if (data[sKey]) data[sKey]._updateGetter_(getter);
			else data[sKey] = new DynamicMultiple(this, sKey, getter);
			return data[sKey];
		}),

		// Dynamic value
		_getDynamicValue_: d(function (sKey) {
			var data = this._dynamicValues_;
			if (!data[sKey]) data[sKey] = new DynamicValue(this, sKey);
			return data[sKey];
		}),

		_forEachOwnDescriptor_: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1];
			callable(cb);
			if (!this.hasOwnProperty('__descriptors__')) return;
			keys(this.__descriptors__).forEach(function (sKey) {
				call.call(cb, thisArg, this[sKey], sKey);
			}, this.__descriptors__);
		}),

		_forEachOwnNestedObject_: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1];
			callable(cb);
			if (!this.hasOwnProperty('__objects__')) return;
			keys(this.__objects__).forEach(function (sKey) {
				call.call(cb, thisArg, this[sKey], sKey);
			}, this.__objects__);
		})

	}, lazy({

		// Descriptors
		_descriptors_: d(function () {
			return injectPrimitive(this, create(this.__descriptors__),
				'__descriptors__');
		}, { cacheName: '__descriptors__', desc: '' }),

		// Neste objects
		_objects_: d(function () { return create(null); },
			{ cacheName: '__objects__', desc: '' }),

		// Observables
		_dynamicListeners_: d(function () { return []; },
			{ cacheName: '__dynamicListeners__', desc: '' }),
		_observableProperties_: d(function () { return create(null); },
			{ cacheName: '__observableProperties__', desc: '' }),

		// Reverse
		_reverseMaps_: d(function () {
			return injectPrimitive(this, create(this.__reverseMaps__ || null),
				'__reverseMaps__');
		}, { cacheName: '__reverseMaps__', desc: '' }),

		// Dynamic multiple
		_dynamicMultiples_: d(function () { return create(null); },
			{ cacheName: '__dynamicMultiples__', desc: '' }),

		// Dynamic value
		_dynamicValues_: d(function () { return create(null); },
			{ cacheName: '__dynamicValues__', desc: '' }),

		// Iterator
		_iterators_: d(function () { return []; },
			{ cacheName: '__iterators__', desc: '' }),

		// Assignments
		_assignments_: d(function () { return new ObjectsSet(); },
			{ cacheName: '__assignments__', desc: '' })

	})));
};
