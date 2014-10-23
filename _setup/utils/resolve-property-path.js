'use strict';

var value          = require('es5-ext/object/valid-value')
  , d              = require('d')
  , unserializeId  = require('../unserialize/id')
  , unserializeKey = require('../unserialize/key')
  , object         = require('../../valid-dbjs-object')
  , nested         = require('../../valid-dbjs-nested-object')

  , Result;

Result = function (object, key) {
	this.object = object;
	this.key = key;
};
Object.defineProperties(Result.prototype, {
	descriptor: d.gs(function () { return this.object.getDescriptor(this.key); }),
	ownDescriptor: d.gs(function () { return this.object.getOwnDescriptor(this.key); }),
	observable: d.gs(function () {
		if (this.object.isKeyStatic(this.key)) return this.object[this.key];
		return this.object.getObservable(this.key);
	}),
	value: d.gs(function () { return this.object.get(this.key); })
});

module.exports = function (obj, id) {
	var names = [];
	object(obj);
	names = [];
	unserializeId(value(id)).forEach(function (token, index) {
		if (index % 2) {
			if (token !== '/') throw new TypeError(id + " is not property id");
			return;
		}
		names.push(token);
	});
	while (names.length > 1) obj = nested(obj.get(unserializeKey(names.shift())));
	return new Result(obj, unserializeKey(names[0]));
};
