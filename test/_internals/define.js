'use strict';

var root         = require('../../lib/types/root')
  , boolean      = require('../../lib/types/boolean')
  , string       = require('../../lib/types/string')
  , FunctionType = require('../../lib/types/function')
  , ObjectType   = require('../../lib/types/object')

  , ns = root.abstract('definetest');

module.exports = function (t, a) {
	var ns2, fn = function () {}, obj;

	ns.set('foo', 'bar');
	a(ns._foo.value, 'bar', "Relation: value");
	a(ns._foo.required, true, "Relation: required");
	a(ns._foo.ns, string, "Relation: namespace");
	a(ns.foo, 'bar', "Value");
	a(ns.hasOwnProperty('foo'), true, "Own");

	ns2 = ns.abstract('definetest2');
	a(ns2.foo, 'bar', "Value: inherited");
	a.not(ns2._foo, ns.foo, "Relation: not inherited");

	ns2.foo = 'other';
	a(ns2.foo, 'other', "Value: written");
	a(ns.foo, 'bar', "Value: not overriden");
	a(ns2._foo.value, 'other', "Relation: written");
	a(ns2.hasOwnProperty('foo'), true, "Inherited but own");

	ns.set('other', boolean.rel({ value: true, required: true }));

	a(ns.other, true, "Define rel transport");

	ns.other = FunctionType.rel({ value: fn });
	a(ns.other, fn, "Set rel transport");

	ns.set('trzy', ns.string);
	a(ns._trzy.ns, ns.string, "Namespace: ns");
	a(ns.trzy, undefined, "Namespace: value");

	obj = new ObjectType({ foo: 'bar2' });
	a(obj._foo.value, 'bar2', "Object: Relation: value");
	a(obj._foo.required, false, "Object: Relation: required");
	a(obj._foo.ns, undefined, "Object: Relation: namespace");
	a(obj.foo, 'bar2', "Object: Value");
	a(obj.hasOwnProperty('foo'), true, "Object: Own");
};
