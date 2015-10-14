'use strict';

var last           = require('es5-ext/string/#/last')
  , d              = require('d')
  , isObjectName   = require('../utils/is-object-name')
  , DbjsError      = require('../error')
  , unserializeKey = require('./key')

  , defineProperty = Object.defineProperty
  , isTypeId = RegExp.prototype.test.bind(/^[A-Z]/);

module.exports = function (db) {
	var objects = db.objects, Base = db.Base, ObjectType = db.Object
	  , proto = Base.prototype, isObjectType = db.isObjectType
	  , data = objects.__setData__
	  , object, char, str, i, pSKey, resolveObject, reject
	  , $object, $descriptor, $property
	  , $descriptorProperty, $item, proposedProto
	  , save, restore;

	save = function () {
		return { object: object, char: char, str: str, i: i, pSKey: pSKey,
			proposedProto: proposedProto };
	};

	restore = function (data) {
		object = data.object;
		char = data.char;
		str = data.str;
		i = data.i;
		pSKey = data.pSKey;
		proposedProto = data.proposedProto;
	};

	reject = function () {
		throw new DbjsError(str + ' is not valid object id',
			'INVALID_OBJECT_ADDRESS');
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
		var start, sKey, data;
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
			if (!proto._keys_[sKey]) {
				data = save();
				proto._serialize_(unserializeKey(sKey, objects));
				restore(data);
			}
		} else {
			start = i + 1;
			while ((char = str[++i])) {
				if (char === '/') break;
				if (char === '*') break;
				if (char === '$') break;
			}
			sKey = str.slice(start, i);
			if ((sKey === '') || (sKey === '$')) reject();
			if (!proto._keys_[sKey]) {
				data = save();
				proto._serialize_(unserializeKey(sKey, objects));
				restore(data);
			}
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
			pSKey = sKey;
			return $item;
		}
		reject();
	};

	$descriptor = function () {
		var start, sKey, data;
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
			if (char !== '/') reject();
			sKey = str.slice(start, i);
			if (!proto._keys_[sKey]) {
				data = save();
				proto._serialize_(unserializeKey(sKey, objects));
				restore(data);
			}
		} else {
			start = i + 1;
			while ((char = str[++i])) {
				if (char === '/') break;
			}
			sKey = str.slice(start, i);
			if (sKey && !proto._keys_[sKey]) {
				data = save();
				proto._serialize_(unserializeKey(sKey, objects));
				restore(data);
			}
		}
		if (!sKey) object = object._descriptorPrototype_;
		else object = object._getOwnDescriptor_(sKey);
		if (!char) {
			if (!sKey) return;
			reject();
		}
		return $descriptorProperty;
	};

	$descriptorProperty = function () {
		var key = str.slice(i + 1);
		object._serialize_(key);
		object = object._getOwnDescriptor_(key);
	};

	$item = function () {
		var sKey, key, data;
		sKey = str.slice(i + 1);
		data = save();
		key = unserializeKey(sKey, objects);
		restore(data);
		object = object._getOwnMultipleItem_(pSKey, key, sKey);
	};

	return function (input, proto) {
		var state, obj, master;
		str = String(input);
		obj = data[str];
		if (obj) {
			if (obj._kind_ === 'item') return obj;
			if ((obj._kind_ === 'object') && !obj.owner) return obj;
		}
		proposedProto = proto;
		state = $object;
		i = -1;
		while ((state = state())) continue; //jslint: ignore
		master = object.master;
		if ((master._kind_ === 'object') && isObjectName(master.__id__) &&
				!db.hasOwnProperty(master.__id__)) {
			defineProperty(db, master.__id__, d(master));
		}
		return object;
	};
};
