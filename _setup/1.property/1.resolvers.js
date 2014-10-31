'use strict';

var assign          = require('es5-ext/object/assign')
  , create          = require('es5-ext/object/create')
  , callable        = require('es5-ext/object/valid-callable')
  , d               = require('d')
  , lazy            = require('d/lazy')
  , injectPrimitive = require('../utils/inject-primitive')
  , observePass     = require('../utils/observe-pass-through')
  , DbjsError       = require('../error')
  , ObjectsSet      = require('../objects-set')
  , Observable      = require('./observable')
  , DynamicMultiple = require('./dynamic-multiple')
  , DynamicValue    = require('./dynamic-value')
  , ReverseMap      = require('./reverse-map')

  , call = Function.prototype.call
  , hasOwnProperty = Object.prototype.hasOwnProperty, keys = Object.keys
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
  , getPrototypeOf = Object.getPrototypeOf, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , desc1, desc2;

module.exports = function (db, object, descriptor) {
	defineProperties(object, assign({
		// Descriptor
		__descriptorPrototype__: d('', descriptor),
		__descriptors__: d('', create(null)),
		isKeyStatic: d(function (key) {
			var obj;
			if (typeof key !== 'string') return false;
			if (!(key in this)) return false;
			obj = this;
			while (!obj.hasOwnProperty(key)) obj = getPrototypeOf(obj);
			return getOwnPropertyDescriptor(obj, key).hasOwnProperty('value');
		}),
		_getCurrentDescriptor_: d(function (sKey) {
			var key = this._keys_[sKey];
			if (this.isKeyStatic(key)) return null;
			return this._getDescriptor_(sKey);
		}),
		_descriptorPrototype_: d.gs(function () {
			if (this.hasOwnProperty('__descriptorPrototype__')) {
				return this.__descriptorPrototype__;
			}
			return this.__descriptorPrototype__._create_(this);
		}),

		_getOwnDescriptor_: d(function (sKey, dbEvent) {
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
		getOwnDescriptor: desc1 = d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			return this._getOwnDescriptor_(sKey);
		}),
		$getOwn: desc1,

		_getDescriptor_: d(function (sKey) {
			return this.__descriptors__[sKey] || this.__descriptorPrototype__;
		}),
		getDescriptor: desc2 = d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			return this._getDescriptor_(sKey);
		}),
		$get: desc2,

		// Nested object
		_getObject_: d(function (sKey) {
			var objects = this._objects_, desc, Type, proto;
			if (objects[sKey]) return objects[sKey];
			desc = this._getDescriptor_(sKey);
			while (!desc.hasOwnProperty('type')) desc = getPrototypeOf(desc);
			if (desc.object !== this) {
				proto = getPrototypeOf(this);
				while (true) {
					if (proto.hasOwnProperty('__objects__') && proto.__objects__[sKey]) {
						return (objects[sKey] =
							proto.__objects__[sKey]._extendNested_(this));
					}
					if (desc.object === proto) break;
					proto = getPrototypeOf(proto);
				}
			}
			Type = desc.type;
			if ((Type !== db.Base) && !db.isObjectType(Type)) Type = db.Base;
			return (objects[sKey] = Type.prototype._extendNested_(this, sKey));
		}),

		// Observables
		getObservable: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			return this._getObservable_(sKey);
		}),
		_getObservable_: d(function (sKey) {
			var observables = this._observableProperties_;
			if (observables[sKey]) return observables[sKey];
			return (observables[sKey] = new Observable(this, sKey));
		}),
		_get: d(function (key) {
			var sKey;
			if (this.isKeyStatic(key)) return this[key];
			sKey = this._serialize_(key);
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
		_getDynamicMultiple_: d(function (sKey, value) {
			var data = this._dynamicMultiples_;
			if (data[sKey]) return data[sKey];
			data[sKey] = new DynamicMultiple(this, sKey, value);
			return data[sKey];
		}),
		_resolveDynamicMultiple_: d(function (sKey, getter) {
			var data = this._dynamicMultiples_, value;
			if (data[sKey]) {
				data[sKey]._updateGetter_(getter);
			} else {
				if (getter) value = getter.call(this, observePass);
				data[sKey] = new DynamicMultiple(this, sKey, value);
			}
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

		// Nested objects
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
		_assignments_: d(function () {
			return defineProperty(new ObjectsSet(), 'dbId', d(this.__id__));
		}, { cacheName: '__assignments__', desc: '' })

	})));
};
