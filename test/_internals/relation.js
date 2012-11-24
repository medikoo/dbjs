'use strict';

var base   = require('../../lib/types/base')
  , string = require('../../lib/types/string');

module.exports = function (a) {
	var ns, ns2, prop, prop2;

	ns = base.abstract('reltest',
		 { foo: string.rel({ required: true, value: 'mario' }) });

	prop = ns._foo;
	a(prop.obj, ns, "Object");
	a(prop.name, 'foo', "Name");

	a(prop.value, 'mario', "Value");
	a(prop.ns, string, "Namespace");
	a(prop.required, true, "Property");

	ns2 = ns.abstract('reltest2');
	ns2.foo = 123;

	prop2 = ns2._foo;
	a(prop2.obj, ns2, "Extended: Object");
	a(prop2.name, 'foo', "Extended: Name");
	a(prop2.value, '123', "Extended: Normalized");
	a(prop2._value, '123', "Extended: Saved normalized");

	prop.ns = null;
	a(prop.ns, base, "Set namespace to null");
	prop.ns = string;
	a(prop.ns, string, "Bring back specific namespace");
	prop.ns = undefined;
	a(prop.ns, base, "Undefine namespace");

	a(prop2.value, '123', "Removed namespace: Not changed extended value");
	prop2.value = 345;
	a(prop2.value, 345, "Removed namespace: Set value");

	prop.ns = string;
	a(prop.ns, string, "Readded namespace: Namespace");
	a(prop2.value, '345', "Readded namespace: Value normalized");
	a(prop2._value, 345, "Readded namespace: Original value intact");

	prop2.value = function () { return 15; };
	a(prop2.value, '15', "Function value");
	prop2.value = function () {};
	a(prop2.value, null, "Function value: null");

	ns.set('lorem', string.rel({ writeOnce: true }));
	ns.lorem = 'ipsum';
	a.throws(function () {
		ns.lorem = 'else';
	}, "Write once");
};
