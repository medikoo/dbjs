'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , memoize   = require('memoizee/lib/primitive')
  , validSet  = require('set-collection/lib/valid-set')
  , ParentSet = require('./object-set')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , ObjectSet, index = 0, intersect, map = {}, identify;

module.exports = ObjectSet = function (a, b) {
	var tmp;
	ParentSet.call(this, a.obj);
	defineProperties(this, extend({
		_other: d(b),
		_setExtensions_: d(a._setExtensions_)
	}, a._setExtensions_ || {}));
	if (a.count > b.count) {
		tmp = a;
		a = b;
		b = tmp;
	}
	a.forEach(function (obj) {
		if (!b.has(obj)) return;
		this[this._serialize(obj)] = obj;
		++this.count;
	}, this);
	a.on('add', this._onAdd.bind(this, b));
	a.on('delete', this._onDelete.bind(this, b));
	b.on('add', this._onAdd.bind(this, a));
	b.on('delete', this._onDelete.bind(this, a));
};

ObjectSet.prototype = Object.create(ParentSet.prototype, extend({
	constructor: d(ObjectSet),
	_onAdd: d(function (other, obj) {
		if (!other.has(obj)) return;
		this[this._serialize(obj)] = obj;
		++this.count;
		this.emit('add', obj);
	}),
	_onDelete: d(function (other, obj) {
		if (!other.has(obj)) return;
		delete this[this._serialize(obj)];
		--this.count;
		this.emit('delete', obj);
	})
}));

intersect = memoize(function (a, b) { return new ObjectSet(map[a], map[b]); });

identify = function (set) {
	if (!validSet(set)._setId_) {
		++index;
		map[index] = defineProperty(set, '_setId_', d(index));
	}
	return set._setId_;
};

defineProperty(ObjectSet, 'defineOn', d(function (set) {
	defineProperty(set, 'intersection', d(function (other) {
		var a = identify(this), b = identify(other);
		if (a > b) return intersect(a, b);
		else return intersect(b, a);
	}));
}));
ObjectSet.defineOn(ParentSet.prototype);
