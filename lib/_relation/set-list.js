'use strict';

var copy        = require('es5-ext/lib/Array/prototype/copy')
  , remove      = require('es5-ext/lib/Array/prototype/remove')
  , callable    = require('es5-ext/lib/Object/valid-callable')
  , d           = require('es5-ext/lib/Object/descriptor')
  , extend      = require('es5-ext/lib/Object/extend')
  , memoize     = require('memoizee/lib/regular')
  , ObjectList  = require('../_proto/object-ordered-list')
  , relation    = require('./')

  , push = Array.prototype.push, sort = Array.prototype.sort
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , listMethod = ObjectList.listMethod
  , ItemsList, proto;

var itemsListMethod = function (compareFn) {
	return new ItemsList(this, callable(compareFn));
};

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
		_history: d('w', copy.call(list))
	});
	set.on('add', list._onAdd);
	set.on('delete', list._onDelete);
	return list;
};

ItemsList.prototype = proto = Object.create(ObjectList.prototype, extend({
	constructor: d(ItemsList),
}, d.binder({
	_onAdd: d(function (value, item, key) {
		push.call(this, item || this.set._getItem_(key, value));
		this._sort();
	}),
	_onDelete: d(function (value, item) {
		remove.call(this, item);
		this._sort();
	}),
})));

defineProperties(relation, {
	list: d(function (compareFn) {
		this._assertSet_();
		if (!this.hasOwnProperty('_list_')) {
			defineProperty(this, '_list_', d(memoize(listMethod)));
		}
		return this._list_(compareFn);
	}),
	itemsList: d(function (compareFn) {
		this._assertSet_();
		if (!this.hasOwnProperty('_itemsList_')) {
			defineProperty(this, '_itemsList_', d(memoize(itemsListMethod)));
		}
		return this._itemsList_(compareFn);
	})
});
