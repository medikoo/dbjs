'use strict';

var CustomError = require('es5-ext/error/custom')
  , d           = require('es5-ext/object/descriptor')
  , forEach     = require('es5-ext/object/for-each')
  , callable    = require('es5-ext/object/valid-callable')
  , values      = require('es5-ext/object/values')
  , ee          = require('event-emitter/lib/core')
  , relation    = require('./')
  , ReadOnlySet = require('../utils/read-only-set')
  , getIndexKey = require('../utils/get-index-key')
  , extendSet   = require('../_proto/extend-set')

  , call = Function.prototype.call
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys

  , Index, RevRel;

RevRel = function () {
	defineProperties(this, {
		count: d('cw', 0),
		_single: d('cw', null)
	});
};
RevRel.prototype = ee(Object.create(ReadOnlySet.prototype, {
	constructor: d(RevRel),
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
		++this.count;
		this._single = this[obj.ns._serialize_(obj)] = obj;
		this.emit('add', obj);
	}),
	_delete: d(function (obj) {
		var key = obj.ns._serialize_(obj);
		if (!this[key]) return;
		delete this[key];
		--this.count;
		if (this._single === obj) this._single = this[keys(this)[0]] || null;
		this.emit('delete', obj);
	}),
	_setExtensions_: d({ _serialize: d(getIndexKey) })
}));
extendSet(RevRel.prototype);

module.exports = Index = function (rel, parent) {
	defineProperties(this, {
		rel: d(rel),
		parent: d(parent || null)
	});
};
defineProperties(ee(Index.prototype), {
	add: d(function (key, obj) {
		var old, rev, isUnique = this.rel.__unique.__value;
		rev = this[key];
		if (!rev) (rev = this[key] = new RevRel());
		if (isUnique) old = rev._single;
		rev._add(obj);
		if (isUnique) this.emit('change', rev._single, old, key);
		this.emit('update');
		if (this.parent) this.parent.add(key, obj);
	}),
	delete: d(function (key, obj) {
		var old, rev, isUnique = this.rel.__unique.__value;
		rev = this[key];
		if (isUnique) old = rev._single;
		rev._delete(obj);
		if (isUnique && (old !== rev._single)) {
			this.emit('change', rev._single, old, key);
		}
		this.emit('update');
		if (this.parent) this.parent.delete(key, obj);
	}),
	get: d(function (key) {
		var revRel = this[key];
		if (!revRel) revRel = this[key] = new RevRel();
		return revRel;
	}),
	getReverse: d(function (key) {
		var revRel = this.get(key);
		return this.rel.__unique.__value ? revRel._single : revRel;
	}),
	setParent: d(function (nu) {
		var old = this.parent;
		if (nu == old) return; //jslint: skip

		// Remove from old, and add to new
		forEach(this, function (index, key) {
			forEach(index, function (obj) {
				if (old) old.delete(key, obj);
				if (nu) nu.add(key, obj);
			}, this);
		}, this);

		if (nu) this.parent = nu;
		else delete this.parent;
	})
});

Object.defineProperties(relation, {
	_index_: d.gs(function () {
		var proto;
		// Get index
		if (!this.obj || (this.obj._type_ !== 'object')) return null;
		proto = getPrototypeOf(this);
		while (proto.obj && (proto.obj._type_ !== 'prototype')) {
			proto = getPrototypeOf(proto);
		}
		if (!proto.obj) return null;
		return proto._selfIndex_;
	}),
	_selfIndex_: d.gs(function () {
		var index, parent;
		// Get index
		if (!this.obj || (this.obj._type_ !== 'prototype')) return null;
		if ((this.obj.ns._childType_ !== 'object') ||
				(this.obj._id_ === 'Object#')) {
			return null;
		}
		if (this.hasOwnProperty('__index_')) return this.__index_;

		// Create new index
		parent = getPrototypeOf(this)._selfIndex_;
		defineProperty(this, '__index_',
			d(index = new Index(this, parent)));
		return index;
	}),
	find: d(function (value) {
		var index = this._selfIndex_;
		if (!index) return null;
		value = this.__ns.__value.normalize(value);
		if (value == null) return null;
		value = this.__ns.__value._serialize_(value);
		if (!value) return null;
		return index.getReverse(value);
	}),
	indexFilter: d(function (value) {
		var index = this._selfIndex_, key;
		if (!index) {
			throw new CustomError("Filter not supported", 'INDEX_NOT SUPPORTED');
		}
		key = getIndexKey(value);
		if (key == null) {
			throw new CustomError("Wrong filter value", 'WRONG_FILTER_VALUE');
		}
		return index.get(key);
	})
});
