'use strict';

var identity    = require('es5-ext/function/identity')
  , d           = require('d/d')
  , memoize     = require('memoizee/lib/regular')
  , memoizePrim = require('memoizee/lib/primitive')
  , memoizeDesc = require('memoizee/lib/d')(memoize)
  , map         = require('observable-value/map')
  , DbjsError   = require('../error')
  , serialize   = require('../serialize/key')

  , defineProperties = Object.defineProperties
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
  , byObjId = function (obj) { return obj.__id__; }
  , resolveFilter;

require('memoizee/lib/ext/resolvers');

resolveFilter = memoize(function (filter) {
	if (filter === undefined) return filterNull;
	if (filter === null) return filterValue;
	if (typeof filter === 'function') return filter;
	return function (value) { return value === filter; };
});

module.exports = function (setProto) {
	return defineProperties(setProto, memoizeDesc({
		filterByKey: d(function (key, filter) {
			var sKey = serialize(key), set, observe;
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			observe = memoizePrim(function (obj) {
				return map(obj._getObservable_(sKey), function (value) {
					return Boolean(filter(value, obj));
				}).on('change', function (event) { set.refresh(obj); });
			}, { serialize: byObjId });
			set = this.filter(function (obj) { return observe(obj).value; });
			return set;
		}, {
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
