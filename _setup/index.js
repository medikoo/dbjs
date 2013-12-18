'use strict';

var assign            = require('es5-ext/object/assign')
  , primitiveSet      = require('es5-ext/object/primitive-set')
  , d                 = require('d/d')
  , lazy              = require('d/lazy')
  , Map               = require('es6-map/primitive')
  , ee                = require('event-emitter/lib/core')
  , ObjectsSet        = require('./objects-set')
  , DbjsError             = require('./error')
  , History           = require('./history')
  , unserializeObject = require('./unserialize/object')

  , setupProp         = require('./1.property')
  , setupMultiple     = require('./2.multiple-item')
  , setupDescProp     = require('./3.descriptor-property')
  , setupType         = require('./4.type')
  , setupDescMeta     = require('./5.descriptor-meta-properties')
  , validDbjsObject   = require('../valid-dbjs-object')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , idDesc = d('', undefined)
  , objDesc = d('', undefined)
  , masterDesc = d('', undefined)
  , initDesc = { __id__: idDesc, __object__: objDesc, master: masterDesc }
  , accessCollector = ee()
  , nativeTypes = primitiveSet('Base', 'Boolean', 'Number', 'String',
	'DateTime', 'RegExp', 'Function', 'Object')
  , deleteObject, Constructor, protoProperties;

deleteObject = function (obj) {
	validDbjsObject(obj);
	if (obj._kind_ === 'object') {
		if (typeof obj === 'function') {
			// Type
			if (nativeTypes[obj.__id__]) {
				throw new DbjsError("Cannot delete native dbjs type",
					'DELETE_NATIVE_TYPE');
			}
		} else if (obj.constructor.prototype === obj) {
			throw new DbjsError("Cannot delete prototype (delete type instead)",
				'DELETE_PROTOTYPE');
		}
	}
	obj._db_._postponed_ += 1;
	obj._destroy_();
	obj._db_._postponed_ -= 1;
};

Constructor = function (id, object, master) {
	if (!object) {
		object = this;
		if (!master) master = this;
	} else if (!master) {
		master = object.master;
	}
	idDesc.value = id;
	objDesc.value = object;
	masterDesc.value = master;
	defineProperties(this, initDesc);
	objDesc.value = masterDesc.value = null;
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
			if (!obj.__object__) return null;
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
	defineProperty(db, 'objects', d(objects));

	// 1. Proto constructor
	createProto = function (proto, id, kind, object) {
		proto = create(proto);
		if (!object) object = proto;
		return defineProperties(proto, assign({
			__id__: d('', id),
			master: d('', object),
			__object__: d('', object),
			_kind_: d('', kind),
			_db_: d('', db),
			toString: d('c', function () { return '[dbjs ' + this.__id__ + ']'; })
		}, protoProperties));
	};

	// 2. Value constructor
	createObj = function (proto, id, object, master) {
		var obj;
		Constructor.prototype = proto;
		obj = new Constructor(id, object, master);
		objects._add(obj);
		proto._descendants_._add(obj);
		return obj;
	};

	object = createProto(Map.prototype, 'Base#', 'object');
	descriptor = createProto(Map.prototype, '$', 'descriptor', object);
	item = createProto(Object.prototype, '*', 'item', object);
	descriptorDescriptor = createProto(Object.prototype, '/', 'sub-descriptor',
		object);

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

	defineProperties(objects, {
		unserialize: d(unserializeObject(db)),
		delete: d(deleteObject)
	});
};
