'use strict';

var assign    = require('es5-ext/object/assign')
  , d         = require('d/d')
  , memoize   = require('memoizee/lib/primitive')
  , ParentSet = require('./object-set')
  , identify  = require('./set-identify')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , ObjectSet, intersect;

module.exports = ObjectSet = function (a, b) {
	var tmp;
	ParentSet.call(this, a.obj);
	defineProperties(this, assign({
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

ObjectSet.prototype = Object.create(ParentSet.prototype, {
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
});

intersect = memoize(function (a, b) {
	return new ObjectSet(identify[a], identify[b]);
});

defineProperty(ObjectSet, 'defineOn', d(function (set) {
	defineProperty(set, 'intersection', d(function (other) {
		var a = identify(this), b = identify(other);
		if (a > b) return intersect(a, b);
		return intersect(b, a);
	}));
}));
ObjectSet.defineOn(ParentSet.prototype);
