'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , memoize   = require('memoizee/lib/regular')
  , ParentSet = require('./object-set')

  , NameSet, extensions;

require('memoizee/lib/ext/method');

var byOrder = function (a, b) {
	return this['_' + a].order - this['_' + b].order;
};

module.exports = NameSet = function (obj) { ParentSet.call(this, obj); };

extensions = extend({
	_serialize: d(function (name) { return ':' + name; }),
	_isPropertyNameSet_: d(true)
}, memoize(function () {
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
}, { method: 'listByOrder' }));

NameSet.prototype = Object.create(ParentSet.prototype, extend({
	constructor: d(NameSet),
	_extensions_: d(extensions)
}, extensions));
