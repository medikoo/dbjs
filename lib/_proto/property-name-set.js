'use strict';

var diff         = require('es5-ext/array/#/diff')
  , extend       = require('es5-ext/object/extend')
  , d            = require('d/d')
  , autoBind     = require('d/auto-bind')
  , ParentSet    = require('./name-set')
  , getTagFilter = require('./property-tag-filter')
  , proto        = require('./')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf
  , objTypes = { namespace: true, prototype: true, object: true }
  , NameSet;

NameSet = function (obj) {
	var master, set;
	if (obj === proto) return obj.getOwnPropertyNames();
	ParentSet.call(this, obj);
	defineProperty(this, '_map', d({}));
	this._addSet(set = obj.getOwnPropertyNames());
	set.forEach(this._add, this);
	defineProperty(this, '_proto', d(getPrototypeOf(obj)));
	this._addSet(set = this._proto.getPropertyNames());
	set.forEach(this._add, this);

	master = obj;
	while (master && !objTypes.hasOwnProperty(master._type_)) master = master.obj;
	if (!master) return;
	if (master._type_ === 'prototype') master = master.ns;
	master.on('selfupdate', this._onSelfUpdate);
};

NameSet.prototype = Object.create(ParentSet.prototype, extend({
	constructor: d(NameSet),
	_addSet: d(function (set) {
		set.on('add', this._onAdd);
		set.on('delete', this._onDelete);
	}),
	_deleteSet: d(function (set) {
		set.off('add', this._onAdd);
		set.off('delete', this._onDelete);
	}),
	_add: d(function (name) {
		if (!this._map.hasOwnProperty(name)) this._map[name] = 0;
		if (++this._map[name] === 1) {
			this[this._serialize(name)] = name;
			++this.count;
			return true;
		}
		return false;
	}),
	_delete: d(function (name) {
		if (!--this._map[name]) {
			delete this[this._serialize(name)];
			--this.count;
			return true;
		}
		return false;
	})
}, autoBind({
	_onAdd: d(function (name) {
		if (this._add(name)) this.emit('add', name);
	}),
	_onDelete: d(function (name) {
		if (this._delete(name)) this.emit('delete', name);
	}),
	_onSelfUpdate: d(function () {
		var nuProto = getPrototypeOf(this.obj), old, nu;
		if (nuProto === this._proto) return;
		this._deleteSet(old = this._proto.getPropertyNames());
		this._proto = nuProto;
		this._addSet(nu = nuProto.getPropertyNames());
		old = this.values;
		nu = this.values;
		diff.call(old, nu).forEach(this._onDelete);
		diff.call(nu, old).forEach(this._onAdd);
	})
})));

defineProperty(proto, 'getPropertyNames', d(function (tag) {
	if (tag != null) {
		return this.getPropertyNames().filter(getTagFilter(String(tag)));
	}
	if (!this.hasOwnProperty('_propertyNames_')) {
		defineProperty(this, '_propertyNames_', d(new NameSet(this)));
	}
	return this._propertyNames_;
}));

defineProperty(proto, 'getProperties', d(function (tag) {
	return this.getPropertyNames(tag).relMap();
}));
