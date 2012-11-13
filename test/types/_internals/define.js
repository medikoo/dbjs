'use strict';

var base = require('../../../lib/types/base')

  , ns = base.abstract('definetest');

module.exports = function (t, a) {
	var ns2, fn = function () {};

	ns.set('foo', 'bar');
	a(ns._foo.value, 'bar', "Relation");
	a(ns.foo, 'bar', "Value");
	a(ns.hasOwnProperty('foo'), true, "Own");

	ns2 = ns.abstract('definetest2');
	a(ns2.foo, 'bar', "Value: inherited");
	a(ns2._foo, undefined, "Relation: not inherited");

	ns2.foo = 'other';
	a(ns2.foo, 'other', "Value: written");
	a(ns.foo, 'bar', "Value: not overriden");
	a(ns2._foo.value, 'other', "Relation: written");
	a(ns2.hasOwnProperty('foo'), true, "Inherited but own");

	ns.set('other', base.boolean.rel({ value: true, required: true }));

	a(ns.other, true, "Define rel transport");

	ns.other = base.Function.rel({ value: fn });
	a(ns.other, fn, "Set rel transport");

	ns.set('trzy', ns.string);
	a(ns._trzy.ns, ns.string, "Namespace: ns");
	a(ns.trzy, undefined, "Namespace: value");
};
