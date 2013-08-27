'use strict';

var d         = require('es5-ext/object/descriptor')
  , extend    = require('es5-ext/object/extend')
  , memoize   = require('memoizee/lib/regular')
  , ParentSet = require('./object-set')

  , defineProperties = Object.defineProperties
  , NameSet, extensions, byOrder, relByOrder, getRel, relMapByOrder;

require('memoizee/lib/ext/method');

byOrder = function (a, b) {
	return this['_' + a].order - this['_' + b].order;
};

relByOrder = function (a, b) { return a.order - b.order; };

getRel = function (name) { return this.get(name); };

relMapByOrder = function () {
	var list = this.list(relByOrder);
	this.forEach(function (rel) { rel._order.on('change', list._sort); });
	this.on('add', function (rel) {
		rel._order.on('change', list._sort);
		list._sort();
	});
	this.on('delete', function (rel) {
		rel._order.off('change', list._sort);
		list._sort();
	});
	return list;
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
}, { method: 'listByOrder' }), memoize(function () {
	var map = this.liveSetMap(getRel), extensions;
	extensions = {
		_serialize: d(function (rel) { return ':' + rel._id_; }),
		listByOrder: d(memoize(relMapByOrder))
	};
	defineProperties(map, extend(extensions, {
		_setExtensions_: d(extensions)
	}));
	return map;
}, { method: 'relMap' }));

NameSet.prototype = Object.create(ParentSet.prototype, extend({
	constructor: d(NameSet),
	_setExtensions_: d(extensions)
}, extensions));
