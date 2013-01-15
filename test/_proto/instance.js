'use strict';

var contains = require('es5-ext/lib/Array/prototype/contains')
  , proto    = require('../../lib/_proto')

  , getPrototypeOf = Object.getPrototypeOf
  , keys = Object.keys;

module.exports = function (a) {
	var obj = proto.$$create('$$protoTest$$');

	a(getPrototypeOf(obj), proto, "Prototype");
	a.deep(keys(obj), [], "Enumerable");
	a(obj._id_, '$$protoTest$$', "Id");
	a(contains.call(proto._children_, obj), true, "Child");
};
