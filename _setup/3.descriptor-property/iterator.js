'use strict';

var remove         = require('es5-ext/array/#/remove')
  , assign         = require('es5-ext/object/assign')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , autoBind       = require('d/auto-bind')
  , Iterator       = require('es6-iterator')
  , kinds          = require('es6-map/_iterator-kinds')
  , byLastModified = require('../utils/compare-by-last-modified')

  , push = Array.prototype.push, defineProperties = Object.defineProperties
  , unBind = Iterator.prototype._unBind
  , DescriptorIterator;

DescriptorIterator = module.exports = function (map, kind) {
	var sKey, sKeys, data;
	if (!(this instanceof DescriptorIterator)) {
		return new DescriptorIterator(map, kind);
	}
	sKeys = [];
	data = map.__descriptors__;
	for (sKey in data) {
		if (data[sKey]._hasValue_()) sKeys.push(sKey);
	}
	Iterator.call(this, sKeys.sort(byLastModified.bind(data)));
	if (!kind || !kinds[kind]) kind = 'key+value';

	defineProperties(this, {
		__kind__: d('', kind),
		__map__: d('w', map)
	});
	map.__object__._getDescriptorIterators_(map._sKey_).push(this);
};
if (setPrototypeOf) setPrototypeOf(DescriptorIterator, Iterator);

DescriptorIterator.prototype = Object.create(Iterator.prototype, assign({
	constructor: d(DescriptorIterator),
	_resolve: d(function (i) {
		if (this.__kind__ === 'value') return this.__map__._get_(this.__list__[i]);
		if (this.__kind__ === 'key') return this.__list__[i];
		return [this.__list__[i], this.__map__._get_(this.__list__[i])];
	}),
	_unBind: d(function () {
		if (!this.__map__) return;
		remove.call(this.__map__.__object__
			._getDescriptorIterators_(this.__map__._sKey_), this);
		this.__map__ = null;
		unBind.call(this);
	}),
	'@@toStringTag': d('c', 'Map Iterator'),
	toString: d(function () { return '[object Map Iterator]'; })
}, autoBind({
	_onDelete: d(function (key) {
		var index = this.__list__.indexOf(key);
		if (index >= this.__nextIndex__) this.__list__.splice(index, 1);
	}),
	_onSet: d(function (key, stamp) {
		var index = this.__list__.indexOf(key);
		if ((index !== -1) && (index < this.__nextIndex__)) return;
		if (index === -1) this.__list__.push(key);
		push.apply(this.__list__, this.__list__.splice(this.__nextIndex__)
			.sort(byLastModified.bind(this.__map__.__descriptors__)));
	})
})));
