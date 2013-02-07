'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , memoize   = require('memoizee/lib/regular')
  , ParentSet = require('./object-set')

  , NameSet;

var byOrder = function (a, b) {
	return this['_' + a].order - this['_' + b].order;
};

module.exports = NameSet = function (obj) { ParentSet.call(this, obj); };

NameSet.prototype = Object.create(ParentSet.prototype, {
	constructor: d(NameSet),
	_serialize: d(function (name) { return ':' + name; }),
	listByOrder: d(memoize(function () {
		var list = this.list(byOrder), obj = this.obj;
		this.forEach(function (name) {
			obj['_' + name]._order.on('change', list._sort);
		});
		this.on('add', function (name) {
			obj['_' + name]._order.on('change', list._sort);
			list._sort();
		});
		this.on('delete', function (name) {
			obj['_' + name]._order.off('change', list._sort);
			list._sort();
		});
		return list;
	}, { method: 'listByOrder' }))
});
