'use strict';

var copy        = require('es5-ext/array/#/copy')
  , isCopy      = require('es5-ext/array/#/is-copy')
  , remove      = require('es5-ext/array/#/remove')
  , CustomError = require('es5-ext/error/custom')
  , callable    = require('es5-ext/object/valid-callable')
  , extend      = require('es5-ext/object/extend')
  , d           = require('d/d')
  , autoBind    = require('d/auto-bind')
  , lazy        = require('d/lazy')
  , once        = require('next-tick/lib/once')
  , ee          = require('event-emitter/lib/core')
  , memoize     = require('memoizee/lib/regular')
  , Mutable     = require('mutable')
  , ObjectSet   = require('./object-set')

  , pop = Array.prototype.pop, push = Array.prototype.push
  , sort = Array.prototype.sort
  , call = Function.prototype.call
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , ObjectList, proto, readOnly;

require('memoizee/lib/ext/resolvers');
require('memoizee/lib/ext/method');

readOnly = function () {
	throw new CustomError("Array is read-only", 'ARRAY_READ_ONLY');
};

module.exports = ObjectList = function (set, compareFn) {
	var list = set.values;
	list.__proto__ = proto;
	compareFn = compareFn && compareFn.bind(set.obj);
	sort.call(list, compareFn);
	defineProperties(list, {
		obj: d(set),
		compareFn: d(compareFn),
		_history: d('w', copy.call(list))
	});
	set.on('add', list._onAdd);
	set.on('delete', list._onDelete);
	return list;
};

ObjectList.prototype = proto = ee(Object.create(Array.prototype, extend({
	constructor: d(ObjectList),
	_isLiveList_: d(true),
	pop: d(readOnly),
	push: d(readOnly),
	reverse: d(readOnly),
	shift: d(readOnly),
	sort: d(readOnly),
	splice: d(readOnly),
	unshift: d(readOnly),
	getReverse: d(function () { return copy.call(this).reverse(); }),
	_sort: d.gs(function () {
		defineProperty(this, '_sort', d(once(this.__sort)));
		return this._sort;
	}),
}, memoize(function (cb/*, thisArg*/) {
	var list, thisArg = arguments[1];
	cb = memoize(callable(cb), { length: 1 });
	list = this.map(cb, thisArg);
	list.__proto__ = proto;
	this.on('change', function () {
		var l;
		this.forEach(function (el, i) { list[i] = call.call(cb, thisArg, el); });
		l = this.length;
		while (list.hasOwnProperty(l)) pop.call(list);
		list.emit('change');
	});
	return list;
}, { method: 'liveMap', length: 2 }), memoize(function (index) {
	var mutable;
	if (isNaN(index)) throw new TypeError("Index is not a number");
	if (index < 0) throw new TypeError("Index must not be negative");
	mutable = new Mutable(this[index]);
	this.on('change', function () { mutable.value = this[index]; });
	return mutable;
}, { method: 'getItem', resolvers: [Number] }), lazy({
	_length: d(function () {
		var mutable = new Mutable(this.length);
		this.on('change', function () { mutable.value = this.length; });
		return mutable;
	})
}), autoBind({
	_onAdd: d(function (obj) {
		push.call(this, obj);
		this._sort();
	}),
	_onDelete: d(function (obj) {
		remove.call(this, obj);
		this._sort();
	}),
	__sort: d(function () {
		sort.call(this, this.compareFn);
		if (isCopy.call(this, this._history)) return this;
		this._history = copy.call(this);
		this.emit('change');
		return this;
	}),
}))));

defineProperty(ObjectList, 'defineOn', d(function (set) {
	defineProperties(set, memoize(function (compareFn) {
		return new ObjectList(this, compareFn);
	}, { method: 'list', protoDeep: true, resolvers: [function (compareFn) {
		return (compareFn == null) ? undefined : callable(compareFn);
	}] }));
}));

ObjectList.defineOn(ObjectSet.prototype);
