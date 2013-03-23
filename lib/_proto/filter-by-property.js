'use strict';

var memoize   = require('memoizee/lib/regular')
  , ObjectSet = require('./object-set')

  , defineProperties = Object.defineProperties
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
  , filterByProperty, defineOn, resolve;

require('memoizee/lib/ext/method');

resolve = memoize(function (filter) {
	if (filter === undefined) return filterNull;
	if (filter === null) return filterValue;
	if (typeof filter === 'function') return filter;
	return function (value) { return value === filter; };
});

filterByProperty = function (name, filter) {
	return this.filter(function (obj, set) {
		var rel, current;
		if (!obj._id_ || !obj._type_) return filter(obj[name]);
		rel = obj.get(name);
		rel.on('change', function (value) {
			value = filter(value);
			if (value === current) return;
			set._update(obj, current = value);
		});
		return (current = filter(rel.value));
	});
};

defineOn = exports.defineOn = function (set) {
	defineProperties(set, memoize(filterByProperty,
		{ method: 'filterByProperty', resolvers: [String, resolve] }));
};
defineOn(ObjectSet.prototype);
