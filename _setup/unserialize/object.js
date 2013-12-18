'use strict';

var last           = require('es5-ext/string/#/last')
  , DbjsError      = require('../error')
  , unserializeKey = require('./key')

  , isTypeId = RegExp.prototype.test.bind(/^[A-Z]/);

module.exports = function (db) {
	var objects = db.objects, Base = db.Base, ObjectType = db.Object
	  , proto = Base.prototype, isObjectType = db.isObjectType
	  , data = objects.__setData__
	  , object, char, str, i, pKey, resolveObject, reject
	  , $object, $descriptor, $property
	  , $descriptorProperty, $item, proposedProto;

	reject = function () {
		throw new DbjsError(str + ' is not valid object id',
			'INVALID_EVENT_STRING');
	};

	resolveObject = function () {
		var id = str.slice(0, i), ProtoType, isProto;
		if (!id) reject();
		if (data[id]) {
			object = data[id];
			return;
		}
		if (last.call(id) === '#') {
			isProto = true;
			id = id.slice(0, -1);
		}
		if (proposedProto) {
			if (isTypeId(proposedProto.__id__)) ProtoType = proposedProto;
			proposedProto = null;
		}
		if (isTypeId(id)) {
			object = (ProtoType || Base)._extend_(id);
		} else {
			if (ProtoType && !isObjectType(ProtoType)) ProtoType = null;
			object = (ProtoType || ObjectType)._create_(id);
		}
		if (isProto) object = object.prototype;
	};

	$object = function () {
		while ((char = str[++i])) {
			if (char === '$') {
				resolveObject();
				return $descriptor;
			}
			if (char === '/') {
				resolveObject();
				return $property;
			}
		}
		resolveObject();
	};

	$property = function () {
		var start, sKey;
		if (str[i + 2] === '"') {
			start = ++i;
			++i;
			while ((char = str[++i])) {
				if (char === '\\') {
					char = str[++i];
					continue;
				}
				if (char === '"') break;
			}
			char = str[++i];
			sKey = str.slice(start, i);
			if (!proto._keys_[sKey]) proto._serialize_(unserializeKey(sKey, objects));
		} else {
			start = i + 1;
			while ((char = str[++i])) {
				if (char === '/') break;
				if (char === '*') break;
			}
			sKey = str.slice(start, i);
			if (sKey === '') reject();
			if (!proto._keys_[sKey]) proto._serialize_(unserializeKey(sKey, objects));
		}
		if (!char) {
			object = object._getOwnDescriptor_(sKey);
			return;
		}
		if (char === '/') {
			object = object._getObject_(sKey);
			return $property;
		}
		if (char === '$') {
			object = object._getObject_(sKey);
			return $descriptor;
		}
		if (char === '*') {
			pKey = sKey;
			return $item;
		}
		reject();
	};

	$descriptor = function () {
		var start, sKey;
		if (str[i + 2] === '"') {
			start = ++i;
			++i;
			while ((char = str[++i])) {
				if (char === '\\') {
					char = str[++i];
					continue;
				}
				if (char === '"') break;
			}
			char = str[++i];
			sKey = str.slice(start, i);
			if (!proto._keys_[sKey]) proto._serialize_(unserializeKey(sKey, objects));
		} else {
			start = i + 1;
			while ((char = str[++i])) {
				if (char === '/') break;
			}
			sKey = str.slice(start, i);
			if (sKey && !proto._keys_[sKey]) {
				proto._serialize_(unserializeKey(sKey, objects));
			}
		}
		if (char !== '/') reject();
		if (!sKey) object = object._descriptorPrototype_;
		else object = object._getOwnDescriptor_(sKey);
		return $descriptorProperty;
	};

	$descriptorProperty = function () {
		var key = str.slice(i + 1);
		object._serialize_(key);
		object = object._getOwnDescriptor_(key);
	};

	$item = function () {
		var sKey, key;
		sKey = str.slice(i + 1);
		key = unserializeKey(sKey, objects);
		object = object._getOwnMultipleItem_(pKey, key, sKey);
	};

	return function (input, proto) {
		var state;
		str = String(input);
		if (data[str]) return data[str];
		proposedProto = proto;
		state = $object;
		i = -1;
		while ((state = state())) continue; //jslint: skip
		return object;
	};
};
