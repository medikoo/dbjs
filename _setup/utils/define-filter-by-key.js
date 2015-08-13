'use strict';

var identity            = require('es5-ext/function/identity')
  , d                   = require('d')
  , memoize             = require('memoizee/plain')
  , memoizeMethods      = require('memoizee/methods-plain')
  , getNormalizer       = require('memoizee/normalizers/get-fixed')
  , setGetFirst         = require('es6-set/ext/get-first')
  , setGetLast          = require('es6-set/ext/get-last')
  , setCopy             = require('es6-set/ext/copy')
  , setEvery            = require('es6-set/ext/every')
  , setSome             = require('es6-set/ext/some')
  , map                 = require('observable-value/map')
  , isObservableValue   = require('observable-value/is-observable-value')
  , DbjsError           = require('../error')
  , serialize           = require('../serialize/key')
  , unserializeKey      = require('../unserialize/key')
  , resolvePropertyPath = require('./resolve-property-path')

  , create = Object.create, defineProperties = Object.defineProperties
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
  , tokenizePath = resolvePropertyPath.tokenize, resolveObject = resolvePropertyPath.resolveObject
  , resolveFilter, baseProto;

resolveFilter = memoize(function (filter) {
	if (filter === undefined) return filterNull;
	if (filter === null) return filterValue;
	if (typeof filter === 'function') return filter;
	return function (value) { return value === filter; };
}, { normalizer: require('memoizee/normalizers/get-1')() });

module.exports = function (setProto) {
	return defineProperties(setProto, memoizeMethods({
		filterByKey: d(function (key, filter) {
			var sKey = serialize(key), set, observed = create(null);
			if (sKey == null) throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			set = this.filter(function (obj) {
				var observable, result, cached;
				cached = observed[obj.__id__];
				if (!cached) {
					if (!obj || (typeof obj._getObservable_ !== 'function')) return false;
					if (obj.isKeyStatic(key)) return filter(obj[key], obj);
					observable = obj._getObservable_(sKey);
					result = filter(observable.value, obj);
					if (isObservableValue(result)) {
						observable = map(observable, function (value) {
							return map(filter(value, obj), Boolean);
						});
						observed[obj.__id__] = result = result.value;
					} else {
						observed[obj.__id__] = true;
					}
					observable.on('change', function () { set.refresh(obj); });
					return result;
				}
				if (cached !== true) return cached.value;
				observable = obj._getObservable_(sKey);
				result = filter(observable.value, obj);
				if (!isObservableValue(result)) return result;
				return result.value;
			});
			return set;
		}, {
			normalizer: getNormalizer(2),
			resolvers: [identity, resolveFilter],
			cacheName: '__filterByKey__',
			desc: ''
		}),
		filterByKeyPath: d(function (path, filter) {
			var tokens = tokenizePath(path), sKey = tokens[tokens.length - 1], key = unserializeKey(sKey)
			  , observed = create(null);
			var set = this.filter(function (obj) {
				var observable, result, cached, targetObj = resolveObject(obj, tokens);
				if (!targetObj) return false;
				cached = observed[obj.__id__];
				if (!cached) {
					if (!targetObj || (typeof targetObj._getObservable_ !== 'function')) return false;
					if (targetObj.isKeyStatic(key)) return filter(targetObj[key], obj);
					observable = targetObj._getObservable_(sKey);
					result = filter(observable.value, obj);
					if (isObservableValue(result)) {
						observable = map(observable, function (value) {
							return map(filter(value, obj), Boolean);
						});
						observed[obj.__id__] = result = result.value;
					} else {
						observed[obj.__id__] = true;
					}
					observable.on('change', function () { set.refresh(obj); });
					return result;
				}
				if (cached !== true) return cached.value;
				observable = targetObj._getObservable_(sKey);
				result = filter(observable.value, obj);
				if (!isObservableValue(result)) return result;
				return result.value;
			});
			return set;
		}, {
			normalizer: getNormalizer(2),
			resolvers: [String, resolveFilter],
			cacheName: '__filterByKeyPath__',
			desc: ''
		})
	}));
};

// Temporary hack
// (until we solve mixed configuration of observable and read only sets)
baseProto = require('observable-set/create-read-only')(require('observable-set')).prototype;
module.exports(baseProto);
defineProperties(baseProto, {
	first: d.gs(setGetFirst),
	last: d.gs(setGetLast),
	copy: d(setCopy),
	every: d(setEvery),
	some: d(setSome)
});
