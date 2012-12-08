'use strict';

var d                = require('es5-ext/lib/Object/descriptor')
  , Base             = require('../types/base')
  , define           = require('./define').define
  , getValueEndIndex = require('./get-value-end-index')

  , reTest = RegExp.prototype.test
  , isDigit = reTest.bind(/\d/), isUpperCase = reTest.bind(/[A-Z]/)
  , objects = exports, createObject;

Object.defineProperties(exports, {
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
		if (!(obj = objects[objId])) obj = objects[objId] = createObject(objId);

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
		var ObjectType = Base.Object;

		if (isUpperCase(id[0]) || !Base.Object) {
			// Constructor
			if (Base.hasOwnProperty(id) && (Base[id] && (Base[id]._id_ === id))) {
				return (objects[id] = Base[id]);
			}
			return (objects[id] = (proto || Base).$create(id));
		}

		// Instance
		if (ObjectType.hasOwnProperty(id) &&
				(ObjectType[id] && (ObjectType[id]._id_ === id))) {
			return (objects[id] = ObjectType[id]);
		}
		return (objects[id] = (proto || ObjectType).prototype.$create(id));
	})
});

// Special cases
objects[''] = require('./relation').prototype;
objects['"'] = require('./rel-set-item').prototype;
