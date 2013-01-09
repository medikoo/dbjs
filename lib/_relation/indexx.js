'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , values   = require('es5-ext/lib/Object/values')
  , relation = require('./')

  , call = Function.prototype.call
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys
  , readOnly = function () { throw new TypeError("Set is read-only"); }

  , Index, Constructor, RevRel;

RevRel = function () {
	defineProperties(this, {
		count: d('cw', 0),
		_single: d('cw', null)
	});
};
defineProperties(RevRel.prototype, {
	_isSet_: d(true),
	add: d(readOnly),
	delete: d(readOnly),
	has: d(function (obj) {
		if (!obj || (obj._type_ !== 'object')) return false;
		return this.propertyIsEnumerable(obj.ns._serialize_(obj));
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(cb);
		keys(this).forEach(function (key, index) {
			call.call(cb, thisArg, this[key], null, this, index);
		}, this);
	}),
	values: d.gs(function () { return values(this); }),
	_add: d(function (obj) {
		this._single = this[obj.ns._serialize_(obj)] = obj;
		++this.count;
	}),
	_delete: d(function (obj) {
		var key = obj.ns._serialize_(obj);
		if (!this[key]) return;
		delete this[key];
		--this.count;
		if (this._single === obj) this._single = this[keys(this)[0]] || null;
	})
});

module.exports = Index = function (rel, parent) {
	defineProperties(this, {
		rel: d(rel),
		parent: d(parent || null)
	});
};
Constructor = function () {};
defineProperties(Index.prototype, {
	add: d(function (key, obj) {
		if (!this[key]) this[key] = new RevRel();
		this[key]._add(obj);
		if (this.parent) this.parent.add(key, obj);
	}),
	delete: d(function (key, obj) {
		this[key]._delete(obj);
		if (this.parent) this.parent.delete(key, obj);
	}),
	get: d(function (key) {
		var revRel = this[key];
		if (!revRel) revRel = this[key] = new RevRel();
		return revRel;
	}),
	getReverse: d(function (key) {
		var revRel = this.get(key);
		return this.rel.unique ? revRel._single : revRel;
	})
});

Object.defineProperties(relation, {
	_index_: d.gs(function () {
		var proto, index;
		// Get index
		if (!this.obj || (this.obj._type_ !== 'object')) return null;
		if (this.obj._id_ === 'Object#') return null;
		proto = getPrototypeOf(this);
		if (proto.obj._id_ === 'Object#') return null;
		if (proto.hasOwnProperty('__index_')) return proto.__index_;

		// Create new index
		defineProperty(proto, '__index_',
			d(index = new Index(proto, proto._index_)));
		return index;
	}),
	_selfIndex_: d.gs(function () {
		var proto, index;
		// Get index
		if (!this.obj) return null;
		if (this.obj._id_ === 'Object#') return null;
		if (this.hasOwnProperty('__index_')) return this.__index_;

		// Create new index
		defineProperty(this, '__index_',
			d(index = new Index(this, this._index_)));
		return index;
	})
});
