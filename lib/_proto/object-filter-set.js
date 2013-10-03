'use strict';

var callable  = require('es5-ext/object/valid-callable')
  , assign    = require('es5-ext/object/assign')
  , d         = require('d/d')
  , autoBind  = require('d/auto-bind')
  , memoize   = require('memoizee/lib/regular')
  , ParentSet = require('./object-set')

  , defineProperties = Object.defineProperties
  , ObjectSet;

require('memoizee/lib/ext/method');

module.exports = ObjectSet = function (set, cb) {
	ParentSet.call(this, set.obj);
	defineProperties(this, assign({
		_filter: d(cb),
		_map: d({}),
		_setExtensions_: d(set._setExtensions_)
	}, set._setExtensions_ || {}));
	set.forEach(function (obj) {
		var accepted, key;
		accepted = this._filter.call(this.obj, obj, this);
		key = this._serialize(obj);
		if (accepted) {
			this[key] = obj;
			++this.count;
			this._map[key] = 3;
		} else {
			this._map[key] = 1;
		}
	}, this);
	set.on('add', this._onAdd);
	set.on('delete', this._onDelete);
};

ObjectSet.prototype = Object.create(ParentSet.prototype, assign({
	constructor: d(ObjectSet),
	_update: d(function (obj, value) {
		var key, nu, old;
		if (obj == null) return;
		key = this._serialize(obj);
		if ((key == null) || !this._map.hasOwnProperty(key)) return;
		old = this._map[key];
		nu = this._map[key] = value ? (old | 2) : (old & ~2);
		if (nu === old) return;
		if (nu === 3) {
			this[key] = obj;
			++this.count;
			this.emit('add', obj);
		} else if (old === 3) {
			delete this[key];
			--this.count;
			this.emit('delete', obj);
		}
	})
}, autoBind({
	_onAdd: d(function (obj) {
		var key = this._serialize(obj);
		if (this._map.hasOwnProperty(key)) {
			this._map[key] = this._map[key] | 1;
		} else {
			this._map[key] = this._filter.call(this.obj, obj, this) ? 3 : 1;
		}
		if (this._map[key] === 3) {
			this[key] = obj;
			++this.count;
			this.emit('add', obj);
		}
	}),
	_onDelete: d(function (obj) {
		var key = this._serialize(obj), old = this._map[key];
		this._map[key] = old & ~1;
		if (old === 3) {
			delete this[key];
			--this.count;
			this.emit('delete', obj);
		}
	})
})));

Object.defineProperty(ObjectSet, 'defineOn', d(function (set) {
	defineProperties(set, memoize(function (cb) {
		return new ObjectSet(this, callable(cb));
	}, { method: 'filter' }));
}));

ObjectSet.defineOn(ParentSet.prototype);
