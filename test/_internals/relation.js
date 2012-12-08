'use strict';

var Base   = require('../../lib/types-base/base')
  , string = require('../../lib/types-base/string');

module.exports = function (a) {
	var ns, ns2, prop, prop2;

	ns = Base.abstract('Reltest',
		 { foo: string.rel({ required: true, value: 'mario' }) });

	prop = ns._foo;
	a(prop.obj, ns, "Object");
	a(prop.name, 'foo', "Name");

	a(prop.value, 'mario', "Value");
	a(prop.ns, string, "Namespace");
	a(prop.required, true, "Property");

	ns2 = ns.abstract('Reltest2');
	ns2.foo = 123;

	prop2 = ns2._foo;
	a(prop2.obj, ns2, "Extended: Object");
	a(prop2.name, 'foo', "Extended: Name");
	a(prop2.value, '123', "Extended: Normalized");
	a(prop2._value, '123', "Extended: Saved normalized");

	prop.ns = null;
	a(prop.ns, Base, "Set namespace to null");
	prop.ns = string;
	a(prop.ns, string, "Bring back specific namespace");
	prop.ns = undefined;
	a(prop.ns, Base, "Undefine namespace");

	a(prop2.value, '123', "Removed namespace: Not changed extended value");
	prop2.value = 345;
	a(prop2.value, 345, "Removed namespace: Set value");

	prop.ns = string;
	a(prop.ns, string, "Readded namespace: Namespace");
	a(prop2.value, '345', "Readded namespace: Value normalized");
	a(prop2._value, 345, "Readded namespace: Original value intact");

	ns2.foo = function () { return 15; };
	a(ns2.foo, '15', "Getter");
	ns2.foo = function () {};
	a(ns2.foo, null, "Getter: null");

	ns2.foo = function (x) { return [this, x]; };
	a.deep(ns2.foo(23), [ns2, 23], "Function");

	ns.set('lorem', string.rel({ writeOnce: true }));
	ns.lorem = 'ipsum';
	a.throws(function () {
		ns.lorem = 'else';
	}, "Write once");
};
