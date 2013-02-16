'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , memoize   = require('memoizee/lib/primitive')
  , validSet  = require('set-collection/lib/valid-set')
  , ParentSet = require('./object-set')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , ObjectSet, index = 0, union, map = {}, identify;

module.exports = ObjectSet = function (a, b) {
	ParentSet.call(this, a.obj);
	defineProperties(this, extend({
		_other: d(b),
		_setExtensions_: d(a._setExtensions_)
	}, a._setExtensions_ || {}));
	a.forEach(function (obj) {
		this[a._serialize(obj)] = obj;
		++this.count;
	}, this);
	b.forEach(function (obj) {
		var key = this._serialize(obj);
		if ((key == null) || this.hasOwnProperty(key)) return;
		this[key] = obj;
		++this.count;
	}, this);
	a.on('add', this._onAdd);
	a.on('delete', this._onDelete.bind(this, b));
	b.on('add', this._onAdd);
	b.on('delete', this._onDelete.bind(this, a));
};

ObjectSet.prototype = Object.create(ParentSet.prototype, extend({
	constructor: d(ObjectSet),
	_onDelete: d(function (other, obj) {
		var key;
		if (other.has(obj)) return;
		key = this._serialize(obj);
		if (key == null) return;
		delete this[key];
		--this.count;
		this.emit('delete', obj);
	})
}, d.binder({
	_onAdd: d(function (obj) {
		var key = this._serialize(obj);
		if ((key == null) || this.hasOwnProperty(key)) return;
		this[key] = obj;
		++this.count;
		this.emit('add', obj);
	})
})));

union = memoize(function (a, b) { return new ObjectSet(map[a], map[b]); });
identify = function (set) {
	if (!validSet(set)._setId_) {
		++index;
		map[index] = defineProperty(set, '_setId_', d(index));
	}
	return set._setId_;
};

defineProperty(ObjectSet, 'defineOn', d(function (set) {
	defineProperty(set, 'union', d(function (other) {
		var a = identify(this), b = identify(other);
		if (a > b) return union(a, b);
		else return union(b, a);
	}));
}));
ObjectSet.defineOn(ParentSet.prototype);
