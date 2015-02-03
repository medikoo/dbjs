'use strict';

var remove         = require('es5-ext/array/#/remove')
  , assign         = require('es5-ext/object/assign')
  , create         = require('es5-ext/object/create')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , autoBind       = require('d/auto-bind')
  , Iterator       = require('es6-iterator')
  , kinds          = require('es6-map/lib/iterator-kinds')

  , push = Array.prototype.push, hasOwnProperty = Object.hasOwnProperty
  , defineProperties = Object.defineProperties
  , unBind = Iterator.prototype._unBind
  , ObjectIterator, getCompareByLastModified;

getCompareByLastModified = function (object, modifiedMap) {
	return function (a, b) {
		if (hasOwnProperty.call(modifiedMap, a)) a = modifiedMap[a];
		else a = modifiedMap[a] = object._getPropertyLastModified_(a);
		if (hasOwnProperty.call(modifiedMap, b)) b = modifiedMap[b];
		else b = modifiedMap[b] = object._getPropertyLastModified_(b);
		return a - b;
	};
};

ObjectIterator = module.exports = function (map, kind) {
	var sKey, sKeys, data, modifiedMap, desc;
	if (!(this instanceof ObjectIterator)) return new ObjectIterator(map, kind);
	sKeys = [];
	data = map.__descriptors__;
	for (sKey in data) {
		if (data[sKey]._hasValue_(map)) sKeys.push(sKey);
	}
	desc = map.__descriptorPrototype__;
	if (desc.nested) {
		for (sKey in map.__objects__) {
			if (!data[sKey]) sKeys.push(sKey);
		}
	} else if (desc.multiple) {
		for (sKey in map.__sets__) {
			if (!data[sKey]) sKeys.push(sKey);
		}
	}
	Iterator.call(this, sKeys);
	if (!kind || !kinds[kind]) kind = 'key+value';
	modifiedMap = create(null);
	defineProperties(this, {
		__kind__: d('', kind),
		__map__: d('w', map),
		__modifiedMap__: d('', modifiedMap),
		__compareFn__: d('', getCompareByLastModified(map, modifiedMap))
	});
	if (this.__list__.some(function (sKey) {
			return (modifiedMap[sKey] = this._getPropertyLastModified_(sKey));
		}, map)) {
		this.__list__.sort(this.__compareFn__);
	}
	map._iterators_.push(this);
};
if (setPrototypeOf) setPrototypeOf(ObjectIterator, Iterator);

ObjectIterator.prototype = Object.create(Iterator.prototype, assign({
	constructor: d(ObjectIterator),
	_resolve: d(function (i) {
		if (this.__kind__ === 'value') return this.__map__._get_(this.__list__[i]);
		if (this.__kind__ === 'key') {
			return this.__map__._keys_[this.__list__[i]];
		}
		return [this.__map__._keys_[this.__list__[i]],
			this.__map__._get_(this.__list__[i])];
	}),
	_unBind: d(function () {
		if (!this.__map__) return;
		remove.call(this.__map__._iterators_, this);
		this.__map__ = null;
		unBind.call(this);
	}),
	'@@toStringTag': d('c', 'Map Iterator'),
	toString: d(function () { return '[object Map Iterator]'; })
}, autoBind({
	_onDelete: d(function (sKey) {
		var index = this.__list__.indexOf(sKey);
		if (index >= this.__nextIndex__) this.__list__.splice(index, 1);
	}),
	_onSet: d(function (sKey, stamp) {
		var index = this.__list__.indexOf(sKey);
		if ((index !== -1) && (index < this.__nextIndex__)) return;
		this.__modifiedMap__[sKey] = stamp;
		if (index === -1) this.__list__.push(sKey);
		push.apply(this.__list__,
			this.__list__.splice(this.__nextIndex__).sort(this.__compareFn__));
	})
})));
