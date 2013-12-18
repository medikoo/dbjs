'use strict';

var assign                = require('es5-ext/object/assign')
  , callable              = require('es5-ext/object/valid-callable')
  , d                     = require('d/d')
  , lazy                  = require('d/lazy')
  , injectPrimitive       = require('../utils/inject-primitive')
  , injectPrimitiveNested = require('../utils/inject-primitive-nested')
  , Observable            = require('./observable')
  , Multiple              = require('./multiple')

  , call = Function.prototype.call
  , hasOwnProperty = Object.prototype.hasOwnProperty, create = Object.create
  , keys = Object.keys, defineProperties = Object.defineProperties;

module.exports = function (object, item) {
	defineProperties(object, assign({

		// Item
		__itemPrototype__: d('', item),
		__multiples__: d('', create(null)),
		_getMultipleItems_: d(function (pKey) {
			var multiples = this._multiples_;
			if (hasOwnProperty.call(multiples, pKey)) return multiples[pKey];
			return injectPrimitiveNested(this,
				multiples[pKey] = create(multiples[pKey] || null),
				'__multiples__', pKey);
		}),
		_getOwnMultipleItem_: d(function (pKey, key, sKey) {
			var setData = this._getMultipleItems_(pKey);
			if (hasOwnProperty.call(setData, sKey)) return setData[sKey];
			if (setData[sKey]) return setData[sKey]._create_(this, setData);
			return item._create_(this, pKey, key, sKey, setData);
		}),
		_getMultipleItem_: d(function (pKey, sKey) {
			var data = this.__mutliples__[pKey];
			if (!data) return this.__itemPrototype__;
			return data[sKey] || this.__itemPrototype__;
		}),

		// Observable
		_getMultipleItemObservable_: d(function (pKey, sKey, key) {
			var observables = this._observableMultipleItems_;
			if (observables[pKey]) observables = observables[pKey];
			else observables = observables[pKey] = create(null);
			if (observables[sKey]) return observables[sKey];
			return (observables[sKey] = new Observable(this, pKey, sKey, key));
		}),

		// Multiple
		_getMultiple_: d(function (sKey) {
			var sets = this._sets_;
			if (hasOwnProperty.call(sets, sKey)) return sets[sKey];
			return (sets[sKey] = new Multiple(this, sKey));
		}),

		// Iterator
		_getMultipleIterators_: d(function (sKey) {
			var iterators = this._multipleIterators_;
			if (hasOwnProperty.call(iterators, sKey)) return iterators[sKey];
			return (iterators[sKey] = []);
		}),

		_forEachOwnItem_: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1];
			callable(cb);
			if (!this.hasOwnProperty('__multiples__')) return;
			keys(this.__multiples__).forEach(function (sKey) {
				keys(this[sKey]).forEach(function (sKey) {
					call.call(cb, thisArg, this[sKey], sKey);
				}, this[sKey]);
			}, this.__multiples__);
		})

	}, lazy({

		// Item
		_multiples_: d(function () {
			return injectPrimitive(this, create(this.__multiples__),
				'__multiples__');
		}, { cacheName: '__multiples__', desc: '' }),

		// Observable
		_observableMultipleItems_: d(function () { return create(null); },
			{ cacheName: '__observableMultipleItems__', desc: '' }),

		// Multiple
		_sets_: d(function () { return create(null); },
			{ cacheName: '__sets__', desc: '' }),

		// Iterator
		_multipleIterators_: d(function () { return create(null); },
			{ cacheName: '__multipleIterators__', desc: '' })
	})));
};
