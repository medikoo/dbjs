'use strict';

var value          = require('es5-ext/object/valid-value')
  , d              = require('d')
  , unserializeId  = require('../unserialize/id')
  , unserializeKey = require('../unserialize/key')
  , object         = require('../../valid-dbjs-object')

  , defineProperty = Object.defineProperty
  , Result;

var tokenize = function (id) {
	var names = [];
	unserializeId(value(id)).forEach(function (token, index) {
		if (index % 2) {
			if (token !== '/') throw new TypeError(id + " is not property id");
			return;
		}
		names.push(token);
	});
	return names;
};

var resolveObject = function (obj, names, _observe) {
	var sKey, propValue;
	while (names.length > 1) {
		sKey = names.shift();
		propValue = obj._get_(sKey);
		if (propValue == null) {
			if (_observe) _observe(obj._getObservable_(sKey));
			return null;
		}
		obj = object(propValue);
	}
	return obj;
};

Result = function (object, sKey) {
	this.object = object;
	this.sKey = sKey;
};
Object.defineProperties(Result.prototype, {
	descriptor: d.gs(function () { return this.object._getDescriptor_(this.sKey); }),
	ownDescriptor: d.gs(function () { return this.object._getOwnDescriptor_(this.sKey); }),
	observable: d.gs(function () {
		if (this.object.isKeyStatic(this.key)) return this.object[this.key];
		return this.object._getObservable_(this.sKey);
	}),
	value: d.gs(function () { return this.object._get_(this.sKey); }),
	id: d.gs(function () {
		return this.object.__id__ + '/' + this.sKey;
	}),
	key: d.gs(function () {
		defineProperty(this, 'key', d(unserializeKey(this.sKey)));
		return this.key;
	})
});

module.exports = exports = function (obj, id, _observe) {
	var names;
	object(obj);
	names = tokenize(id);
	obj = resolveObject(obj, names, _observe);
	return new Result(obj, names[0]);
};
exports.tokenize = tokenize;
exports.resolveObject = resolveObject;
exports.Result = Result;
