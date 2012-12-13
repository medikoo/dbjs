'use strict';

var d                = require('es5-ext/lib/Object/descriptor')
  , endsWith         = require('es5-ext/lib/String/prototype/ends-with')
  , Base             = require('../types-base/base')
  , define           = require('./define').define
  , getValueEndIndex = require('./get-value-end-index')

  , reTest = RegExp.prototype.test
  , isDigit = reTest.bind(/\d/), isUpperCase = reTest.bind(/[A-Z]/)
  , objects = exports, createObject;

Object.defineProperties(exports, {
	_get: d(function (id) {
		var obj = objects.hasOwnProperty(id) && objects[id];
		return obj || exports._create(id);
	}),
	_create: d(function (id) {
		var obj, objId, i = id.indexOf(':'), name, pre;
		if (i > -1) {
			objId = id.slice(0, i);
			id = id.slice(i + 1);
		} else {
			objId = id;
			id = '';
		}

		// Find object
		obj = (objects.hasOwnProperty(objId) && objects[objId]) || null;
		if (!obj) obj = objects[objId] = createObject(objId);

		// Find properties
		while (id) {
			i = id.indexOf(':');
			if (i > -1) {
				name = id.slice(0, i);
				id = id.slice(i + 1);
				pre = objects[obj._id_ + ':' + name];
			} else {
				name = id;
				id = '';
			}
			if (!pre) {
				pre = obj['_' + name];
				if (!pre) {
					define(obj, name);
					pre = obj['_' + name];
					if (!pre) {
						console.log(obj._id_, name, obj[name]);
					}
				}
				objects[pre._id_] = pre;
			}
			obj = pre;
			pre = null;

			if (id && isDigit(id[0])) {
				// Set item
				i = getValueEndIndex(id);
				name = id.slice(0, i);
				id = id.slice(i + 2);
				if (id) pre = objects[obj._id_ + ':' + name + '"'];
				if (!pre) {
					pre = obj.hasOwnProperty(name) && obj[name];
					if (!pre) {
						obj.$setItem(name);
						pre = obj[name];
					}
					objects[pre._id_] = pre;
				}
				obj = pre;
				pre = null;
			}
		}

		return obj;
	}),
	_createObject: d(createObject = function (id, proto) {
		var ObjectType = Base.Object, isProto, obj;

		if (isUpperCase(id[0]) || !Base.Object) {
			// Constructor or prototype
			if (endsWith.call(id, '#')) {
				isProto = true;
				id = id.slice(0, -1);
				if (proto) proto = proto.ns;
			}
			if (Base.hasOwnProperty(id) && (Base[id] && (Base[id]._id_ === id))) {
				obj = objects[id] = Base[id];
				objects[id + '#'] = obj.prototype;
				return isProto ? obj.prototype : obj;
			}
			obj = objects[id] = (proto || Base).$create(id);
			objects[id + '#'] = obj.prototype;
			return isProto ? obj.prototype : obj;
		}

		// Instance
		if (ObjectType.hasOwnProperty(id) &&
				(ObjectType[id] && (ObjectType[id]._id_ === id))) {
			return (objects[id] = ObjectType[id]);
		}
		return (objects[id] = (proto || ObjectType.prototype).$create(id));
	})
});

// Special cases
objects[''] = require('./relation').prototype;
objects['"'] = require('./rel-set-item').prototype;
