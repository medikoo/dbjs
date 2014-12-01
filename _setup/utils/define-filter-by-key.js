'use strict';

var identity       = require('es5-ext/function/identity')
  , d              = require('d')
  , memoize        = require('memoizee/plain')
  , memoizeMethods = require('memoizee/methods-plain')
  , getNormalizer  = require('memoizee/normalizers/get-fixed')
  , setGetFirst    = require('es6-set/ext/get-first')
  , setGetLast     = require('es6-set/ext/get-last')
  , setCopy        = require('es6-set/ext/copy')
  , setEvery       = require('es6-set/ext/every')
  , setSome        = require('es6-set/ext/some')
  , map            = require('observable-value/map')
  , DbjsError      = require('../error')
  , serialize      = require('../serialize/key')

  , defineProperties = Object.defineProperties
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
  , byObjId = function (args) { return args[0].__id__; }
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
			var sKey = serialize(key), set, observe;
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			observe = memoize(function (obj) {
				if (!obj || (typeof obj._getObservable_ !== 'function')) return false;
				return map(obj._getObservable_(sKey), function (value) {
					return map(filter(value, obj), Boolean);
				}).on('change', function (event) { set.refresh(obj); });
			}, { normalizer: byObjId });
			set = this.filter(function (obj) {
				var observable = observe(obj);
				if (typeof observable === 'boolean') return observable;
				return observable.value;
			});
			return set;
		}, {
			normalizer: getNormalizer(2),
			resolvers: [identity, resolveFilter],
			cacheName: '__filterByKey__',
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
