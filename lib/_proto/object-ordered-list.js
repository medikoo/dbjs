'use strict';

var copy        = require('es5-ext/lib/Array/prototype/copy')
  , isCopy      = require('es5-ext/lib/Array/prototype/is-copy')
  , remove      = require('es5-ext/lib/Array/prototype/remove')
  , CustomError = require('es5-ext/lib/Error/custom')
  , callable    = require('es5-ext/lib/Object/valid-callable')
  , d           = require('es5-ext/lib/Object/descriptor')
  , extend      = require('es5-ext/lib/Object/extend')
  , once        = require('next-tick/lib/once')
  , ee          = require('event-emitter/lib/core')
  , memoize     = require('memoizee/lib/regular')
  , ObjectSet   = require('./object-set')

  , push = Array.prototype.push, sort = Array.prototype.sort
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , ObjectList, proto;

var readOnly = function () {
	throw new CustomError("Array is read-only", 'ARRAY_READ_ONLY');
};

module.exports = ObjectList = function (set, compareFn) {
	var list = set.values;
	list.__proto__ = proto;
	compareFn = compareFn.bind(set.obj);
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
	})
}, d.binder({
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

defineProperty(ObjectSet.prototype, 'list', d(memoize(function (compareFn) {
	return new ObjectList(this, callable(compareFn));
}, { method: 'list' })));
