'use strict';

var contains = require('es5-ext/lib/Array/prototype/contains')
  , Proto    = require('../../lib/_proto')

  , getPrototypeOf = Object.getPrototypeOf
  , keys = Object.keys;

module.exports = function () {
	return {
		"Constructor": function (a) {
			var constructor = function () {}, proto;

			Proto.$$create(constructor, '$$constructorTest$$');
			proto = constructor.prototype;
			a(getPrototypeOf(constructor), Proto, "Prototype");
			a(getPrototypeOf(proto), Proto.prototype, "Proto: Prototype");
			a.deep(keys(constructor), [], "Enumerable");
			a.deep(keys(proto), [], "Proto: Enumerable");
			a(constructor._id_, '$$constructorTest$$', "Id");
			a(proto._id_, '$$constructorTest$$#', "Proto: Id");

			a(contains.call(Proto._children_, constructor), true, "Child");
			a(contains.call(Proto.prototype._children_, proto), true, "Proto: Child");
		},
		"Prototype": function (a) {
			var obj = Proto.prototype.$$create('$$protoTest$$');

			a(getPrototypeOf(obj), Proto.prototype, "Prototype");
			a.deep(keys(obj), [], "Enumerable");
			a(obj._id_, '$$protoTest$$', "Id");
			a(contains.call(Proto.prototype._children_, obj), true, "Child");
		}
	};
};
