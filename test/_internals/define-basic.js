'use strict';

var Base    = require('../../lib/types-base/base')
  , dummyNs = require('../../lib/_internals/dummy-ns')

  , ns = Base.create('Definebasictest');

module.exports = function (t, a) {
	var ns2;

	t(ns, 'foo', 'bar');
	ns._foo._normalize = function (value) {
		return (value === undefined) ? value : String(value);
	};
	a(ns._foo.value, 'bar', "Relation: value");
	a(ns._foo.name, 'foo', "Relation: name");
	a(ns._foo.obj, ns, "Relation: object");
	a(ns._foo.ns, dummyNs, "Relation: namespace");
	a(ns.foo, 'bar', "Value");
	a(ns.hasOwnProperty('foo'), true, "Own");

	ns2 = ns.create('Definebasictest2');
	a(ns2.foo, 'bar', "Value: inherited");
	a.not(ns2._foo, ns.foo, "Relation: not inherited");
	a(ns2.hasOwnProperty('foo'), false, "Inherited not own");

	ns2.foo = 'other';
	a(ns2.foo, 'other', "Value: written");
	a(ns.foo, 'bar', "Value: not overriden");
	a(ns2._foo.value, 'other', "Relation: written");
	a(ns2.hasOwnProperty('foo'), true, "Inherited but own");

	ns2.foo = undefined;
	a(ns2.foo, 'bar', "Value: Delete");
	a(ns2.hasOwnProperty('foo'), false, "Value: Delete: Own");
};
