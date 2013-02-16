'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , memoize   = require('memoizee/lib/primitive')
  , ParentSet = require('./object-set')
  , identify  = require('./set-identify')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , ObjectSet, complement;

module.exports = ObjectSet = function (a, b) {
	ParentSet.call(this, a.obj);
	defineProperties(this, extend({
		_self: d(a),
		_other: d(b),
		_setExtensions_: d(a._setExtensions_)
	}, a._setExtensions_ || {}));
	b.forEach(function (obj) {
		var key;
		if (a.has(obj)) return;
		key = this._serialize(obj);
		if (key == null) return;
		this[key] = obj;
		++this.count;
	}, this);
	a.on('add', this._onSelfAdd);
	a.on('delete', this._onSelfDelete);
	b.on('add', this._onOtherAdd);
	b.on('delete', this._onSelfAdd);
};

ObjectSet.prototype = Object.create(ParentSet.prototype, extend({
	constructor: d(ObjectSet)
}, d.binder({
	_onSelfAdd: d(function (obj) {
		var key = this._serialize(obj);
		if (!this.hasOwnProperty(key)) return;
		delete this[this._serialize(obj)];
		--this.count;
		this.emit('delete', obj);
	}),
	_onSelfDelete: d(function (obj) {
		var key;
		if (!this._other.has(obj)) return;
		key = this._serialize(obj);
		if (key == null) return;
		this[key] = obj;
		++this.count;
		this.emit('add', obj);
	}),
	_onOtherAdd: d(function (obj) {
		var key;
		if (this._self.has(obj)) return;
		key = this._serialize(obj);
		if (key == null) return;
		this[key] = obj;
		++this.count;
		this.emit('add', obj);
	})
})));

complement = memoize(function (a, b) {
	return new ObjectSet(identify[a], identify[b]);
});

defineProperty(ObjectSet, 'defineOn', d(function (set) {
	defineProperty(set, 'complement', d(function (other) {
		return complement(identify(this), identify(other));
	}));
}));
ObjectSet.defineOn(ParentSet.prototype);
