'use strict';

var aFrom      = require('es5-ext/array/from')
  , remove     = require('es5-ext/array/#/remove')
  , callable   = require('es5-ext/object/valid-callable')
  , assign     = require('es5-ext/object/assign')
  , d          = require('d/d')
  , autoBind   = require('d/auto-bind')
  , memoize    = require('memoizee/lib/regular')
  , extendSet  = require('../_proto/extend-set')
  , ObjectList = require('../_proto/object-ordered-list')
  , relation   = require('./')

  , push = Array.prototype.push, sort = Array.prototype.sort
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , ItemsList, proto, byOrder, toValue, itemsListMethod;

byOrder = function (a, b) { return a.order - b.order; };
toValue = function (item) { return item._subject_; };

ItemsList = function (set, compareFn) {
	var list = [];
	set.forEach(function (value, item, set, index, key) {
		list.push(item || set._getItem_(key, value));
	});
	list.__proto__ = proto;
	compareFn = compareFn.bind(set);
	sort.call(list, compareFn);
	defineProperties(list, {
		obj: d(set),
		compareFn: d(compareFn),
		_history: d('w', aFrom(list))
	});
	set.on('add', list._onAdd);
	set.on('delete', list._onDelete);
	return list;
};

ItemsList.prototype = proto = Object.create(ObjectList.prototype, assign({
	constructor: d(ItemsList)
}, autoBind({
	_onAdd: d(function (value, item, key) {
		push.call(this, item || this.set._getItem_(key, value));
		this._sort();
	}),
	_onDelete: d(function (value, item) {
		remove.call(this, item);
		this._sort();
	})
})));

itemsListMethod = function (compareFn) {
	return new ItemsList(this, callable(compareFn));
};

extendSet(relation);
defineProperties(relation, {
	listByOrder: d(function () {
		this._assertSet_();
		if (!this.hasOwnProperty('_listByOrder_')) {
			defineProperty(this, '_listByOrder_',
				d(this.itemsListByOrder().liveMap(toValue)));
		}
		return this._listByOrder_;
	}),
	itemsList: d(function (compareFn) {
		this._assertSet_();
		if (!this.hasOwnProperty('_itemsList_')) {
			defineProperty(this, '_itemsList_', d(memoize(itemsListMethod)));
		}
		return this._itemsList_(compareFn);
	}),
	itemsListByOrder: d(function () {
		var list;
		this._assertSet_();
		if (!this.hasOwnProperty('_itemsListByOrder_')) {
			list = this.itemsList(byOrder);
			list.forEach(function (item) { item._order.on('change', list._sort); });
			this.on('add', function (value, item, key) {
				(item || this._getItem_(key, value))._order.on('change', list._sort);
			});
			this.on('delete', function (value, item) {
				item._order.off('change', list._sort);
			});
			defineProperty(this, '_itemsListByOrder_', d(list));
		}
		return this._itemsListByOrder_;
	})
});
