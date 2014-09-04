'use strict';

var assign            = require('es5-ext/object/assign')
  , create            = require('es5-ext/object/create')
  , primitiveSet      = require('es5-ext/object/primitive-set')
  , d                 = require('d')
  , lazy              = require('d/lazy')
  , Map               = require('es6-map/primitive')
  , ee                = require('event-emitter')
  , ObjectsSet        = require('./objects-set')
  , DbjsError         = require('./error')
  , History           = require('./history')
  , unserializeObject = require('./unserialize/object')

  , setupProp         = require('./1.property')
  , setupMultiple     = require('./2.multiple-item')
  , setupDescProp     = require('./3.descriptor-property')
  , setupType         = require('./4.type')
  , setupDescMeta     = require('./5.descriptor-meta-properties')
  , validDbjsKind     = require('../valid-dbjs-kind')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , idDesc = d('', undefined)
  , valueIdDesc = d('', undefined)
  , objDesc = d('', undefined)
  , masterDesc = d('', undefined)
  , initDesc = { __id__: idDesc, __valueId__: valueIdDesc, object: objDesc,
	master: masterDesc }
  , accessCollector = ee()
  , nativeTypes = primitiveSet('Base', 'Boolean', 'Number', 'String',
	'DateTime', 'RegExp', 'Function', 'Object')
  , deleteObject, Constructor, protoProperties;

deleteObject = function (obj) {
	validDbjsKind(obj);
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
	obj.database._postponed_ += 1;
	obj._destroy_();
	obj.database._postponed_ -= 1;
};

Constructor = function (id, valueId, object, master) {
	if (!object) {
		object = this;
		if (!master) master = this;
	} else if (!master) {
		master = object.master;
	}
	idDesc.value = id;
	valueIdDesc.value = valueId;
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
			if (!obj.object) return null;
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
			__valueId__: d('', id),
			_kind_: d('', kind),
			master: d('', object),
			object: d('', object),
			database: d('', db),
			toString: d('c', function () { return '[dbjs ' + this.__id__ + ']'; })
		}, protoProperties));
	};

	// 2. Value constructor
	createObj = function (proto, id, valueId, object, master) {
		var obj;
		Constructor.prototype = proto;
		obj = new Constructor(id, valueId, object, master);
		objects._add(obj);
		proto._descendants_._add(obj);
		return obj;
	};

	objects._add(object = createProto(Map.prototype, 'Base#', 'object'));
	objects._add(descriptor = createProto(Map.prototype, '$', 'descriptor', object));
	objects._add(item = createProto(Object.prototype, '*', 'item', object));
	objects._add(descriptorDescriptor = createProto(Object.prototype, '/', 'sub-descriptor',
		object));

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
