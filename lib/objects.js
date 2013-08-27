'use strict';

var d                = require('es5-ext/object/descriptor')
  , endsWith         = require('es5-ext/string/#/ends-with')
  , getValueEndIndex = require('./utils/get-value-end-index')

  , reTest = RegExp.prototype.test
  , isDigit = reTest.bind(/\d/), isUpperCase = reTest.bind(/[A-Z]/)
  , objects = exports, createObject, create;

createObject = function (id, proto) {
	var isProto, obj;

	if (isUpperCase(id[0])) {
		// Constructor or its prototype
		if (endsWith.call(id, '#')) {
			isProto = true;
			id = id.slice(0, -1);
			if (proto) proto = proto.ns;
		}

		if (!proto || (typeof proto !== 'function') ||
				(objects[proto._id_] !== proto)) {
			proto = objects.Base;
		}
		obj = proto.$$create(id);
		return isProto ? obj.prototype : obj;
	}

	// Instance
	if (!proto || (typeof proto === 'function') ||
			(objects[proto._id_] !== proto)) {
		proto = objects['Object#'];
	}
	return proto.$$create(id);
};

create = function (id, proto) {
	var obj, token, i = id.indexOf(':');
	if (i === -1) return createObject(id, proto);
	token = id.slice(0, i);
	id = id.slice(i + 1);

	// Find object
	obj = (objects.hasOwnProperty(token) && objects[token]) || null;
	if (!obj) obj = createObject(token);

	// Find properties
	while (id) {
		i = id.indexOf(':');
		if (i > -1) {
			token = id.slice(0, i);
			id = id.slice(i + 1);
		} else {
			token = id;
			id = '';
		}

		if (token === '"') {
			obj = obj._itemPrototype_;
		} else {
			obj = obj.get(token);
			if (id && isDigit(id[0])) {
				// Set item
				i = getValueEndIndex(id);
				token = id.slice(0, i);
				id = id.slice(i + 2);
				obj = obj._getItem_(token);
			}
		}
	}

	return obj;
};

Object.defineProperties(exports, {
	_get: d(function (id, proto) {
		return (objects.hasOwnProperty(id) && objects[id]) ||
			create(String(id), proto);
	})
});
