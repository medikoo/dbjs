'use strict';

var identity       = require('es5-ext/function/i')
  , assign         = require('es5-ext/object/assign')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , memoize        = require('memoizee/lib/regular')
  , memoizeDesc    = require('memoizee/lib/d')(memoize)
  , Set            = require('es6-set')
  , MultiSet       = require('observable-multi-set/primitive')
  , DbjsError      = require('../error')
  , serialize      = require('../serialize/object')

  , defineProperty = Object.defineProperty
  , filter = function (obj) { return obj.constructor.prototype !== obj; }
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
  , Instances, resolveFilter;

require('memoizee/lib/ext/resolvers');

resolveFilter = memoize(function (filter) {
	if (filter === undefined) return filterNull;
	if (filter === null) return filterValue;
	if (typeof filter === 'function') return filter;
	return function (value) { return value === filter; };
});

Instances = module.exports = function (Type) {
	var sets = new Set(), onAdd, onDelete, onChange;
	onAdd = function (Constructor) {
		sets.add(Constructor.prototype._descendants_.filter(filter));
		Constructor._descendants_.on('change', onChange);
		Constructor._descendants_.forEach(onAdd);
	};
	onDelete = function (Constructor) {
		sets.delete(Constructor.prototype._descendants_.filter(filter));
		Constructor._descendants_.off('change', onChange);
		Constructor._descendants_.forEach(onDelete);
	};
	onChange = function (event) {
		var type = event.type;
		if (type === 'add') {
			onAdd(event.value);
			return;
		}
		if (type === 'delete') {
			onDelete(event.value);
			return;
		}
		// Must not happen, left for eventual awareness
		throw new Error("Unsupported event");
	};
	onAdd(Type);
	MultiSet.call(this, sets, serialize);
	defineProperty(this, '__type__', d('', Type));
	sets = this.sets;
};
setPrototypeOf(Instances, MultiSet);

Instances.prototype = Object.create(MultiSet.prototype, assign({
	constructor: d(Instances)
}, memoizeDesc({
	filterByKey: d(function (key, filter) {
		var sKey = this.__type__._serialize_(key), set;
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
})));
