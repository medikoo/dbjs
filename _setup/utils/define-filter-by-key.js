'use strict';

var identity       = require('es5-ext/function/identity')
  , d              = require('d')
  , memoize        = require('memoizee/plain')
  , memoizeMethods = require('memoizee/methods-plain')
  , getNormalizer  = require('memoizee/normalizers/get-fixed')
  , map            = require('observable-value/map')
  , DbjsError      = require('../error')
  , serialize      = require('../serialize/key')

  , defineProperties = Object.defineProperties
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
  , byObjId = function (args) { return args[0].__id__; }
  , resolveFilter;

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
				return map(obj._getObservable_(sKey), function (value) {
					return Boolean(filter(value, obj));
				}).on('change', function (event) { set.refresh(obj); });
			}, { normalizer: byObjId });
			set = this.filter(function (obj) { return observe(obj).value; });
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
module.exports(require('observable-set/create-read-only')(
	require('observable-set')
).prototype);
