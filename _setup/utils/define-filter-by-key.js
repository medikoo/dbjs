'use strict';

var identity    = require('es5-ext/function/i')
  , d           = require('d/d')
  , memoize     = require('memoizee/lib/regular')
  , memoizeDesc = require('memoizee/lib/d')(memoize)
  , DbjsError   = require('../error')
  , serialize   = require('../serialize/key')

  , defineProperties = Object.defineProperties
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
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
			var sKey = serialize(key), set;
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			set = this.filter(function (obj) {
				var observable, current;
				observable = obj._getObservable_(sKey);
				observable.on('change', function (event) {
					var value = event.newValue;
					value = Boolean(filter(value, obj));
					if (value === current) return;
					set.refresh(obj);
				});
				(current = Boolean(filter(observable.value, obj)));
				return current;
			});
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
