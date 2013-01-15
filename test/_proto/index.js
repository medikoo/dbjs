'use strict';

var contains = require('es5-ext/lib/Array/prototype/contains')

  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys;

module.exports = function (t, a) {
	var obj = t.$$create('$$protoTest$$');

	a(getPrototypeOf(obj), t, "Prototype");
	a.deep(keys(obj), [], "Enumerable");
	a(obj._id_, '$$protoTest$$', "Id");
	a(contains.call(t._children_, obj), true, "Child");
};
