'use strict';

var assign            = require('es5-ext/object/assign')
  , d                 = require('d/d')
  , lazy              = require('d/lazy')
  , Map               = require('es6-map/primitive')
  , ee                = require('event-emitter/lib/core')
  , ObjectsSet        = require('./objects-set')
  , History           = require('./history')
  , unserializeObject = require('./unserialize/object')

  , setupProp         = require('./1.property')
  , setupMultiple     = require('./2.multiple-item')
  , setupDescProp     = require('./3.descriptor-property')
  , setupType         = require('./4.type')
  , setupDescMeta     = require('./5.descriptor-meta-properties')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , idDesc = d('', undefined)
  , masterDesc = d('', undefined)
  , initDesc = { __id__: idDesc, __master__: masterDesc }
  , accessCollector = ee()
  , Constructor, protoProperties;

Constructor = function (id, master) {
	idDesc.value = id;
	masterDesc.value = master || this;
	defineProperties(this, initDesc);
	masterDesc.value = null;
};

protoProperties = assign({
	_lastOwnEvent_: d.gs(function () {
		if (!this.hasOwnProperty('__history__')) return null;
		return this.__history__[0] || null;
	}),
	_lastOwnModified_: d.gs(function () {
		var event = this._lastOwnEvent_;
		if (!event) return 0;
		return event.stamp;
	}),
	_lastEvent_: d.gs(function () {
		var obj = this;
		while (!obj.hasOwnProperty('_value_')) {
			obj = getPrototypeOf(obj);
			if (!obj.__master__) return null;
		}
		return obj._lastOwnEvent_;
	}),
	lastModified: d.gs(function () {
		var event = this._lastEvent_;
		if (!event) return 0;
		return event.stamp;
	})
}, lazy({
	_descendants_: d(function () { return new ObjectsSet(); },
		{ cacheName: '__descendants__', desc: '' }),
	_history_: d(function () { return new History(); },
		{ cacheName: '__history__', desc: '' })
}));

module.exports = function (db) {
	var createObj, createProto, objects, object, descriptor, item
	  , descriptorDescriptor;

	// 0. Empty space
	objects = new ObjectsSet();
	defineProperties(db, {
		objects: d(objects)
	});

	// 1. Proto constructor
	createProto = function (proto, id) {
		return defineProperties(create(proto), assign({
			__id__: d('', id),
			__master__: d('', proto),
			_db_: d('', db),
			toString: d('c', function () { return '[dbjs ' + this.__id__ + ']'; })
		}, protoProperties));
	};

	// 2. Value constructor
	createObj = function (proto, id, master) {
		var obj;
		Constructor.prototype = proto;
		obj = new Constructor(id, master);
		objects._add(obj);
		proto._descendants_._add(obj);
		return obj;
	};

	object = createProto(Map.prototype, 'Base#');
	descriptor = createProto(Map.prototype, '$', object);
	item = createProto(Object.prototype, '*', object);
	descriptorDescriptor = createProto(Object.prototype, '/', object);

	setupProp(db, createObj, object, descriptor, item, descriptorDescriptor,
		accessCollector);
	setupMultiple(db, createObj, object, descriptor, item, descriptorDescriptor,
		accessCollector);
	setupDescProp(db, createObj, object, descriptor, item, descriptorDescriptor,
		accessCollector);
	setupType(db, createObj, object, descriptor, item, descriptorDescriptor,
		accessCollector);
	setupDescMeta(db, createObj, object, descriptor, item, descriptorDescriptor,
		accessCollector);

	defineProperty(objects, 'unserialize', d(unserializeObject(db)));
};
