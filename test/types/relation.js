'use strict';

var base      = require('../../lib/types/base');

require('../../lib/types/string');

module.exports = function (a) {
	var ns, ns2, prop, prop2;

	ns = base.abstract('reltest',
		 { foo: base.string.rel({ required: true, value: 'mario' }) });

	prop = ns._foo;
	a(prop.obj, ns, "Object");
	a(prop.name, 'foo', "Name");

	a(prop.value, 'mario', "Value");
	a(prop.ns, base.string, "Namespace");
	a(prop.required, true, "Property");

	ns2 = ns.abstract('reltest2');
	ns2.foo = 123;

	prop2 = ns2._foo;
	a(prop2.obj, ns2, "Extended: Object");
	a(prop2.name, 'foo', "Extended: Name");
	a(prop2.value, '123', "Extended: Normalized");
	a(prop2._value, '123', "Extended: Saved normalized");

	prop.ns = null;
	a(prop.ns, null, "Removed namespace: namespace");

	a(prop2.value, '123', "Removed namespace: Not changed extended value");
	prop2.value = 345;
	a(prop2.value, 345, "Removed namespace: Set value");

	prop.ns = base.string;
	a(prop.ns, base.string, "Readded namespace: Namespace");
	a(prop2.value, '345', "Readded namespace: Value normalized");
	a(prop2._value, 345, "Readded namespace: Original value intact");

	prop.validate = function (value) {
		a(this, prop2, "Validate: Context");
		if (!/^\d{3}$/.test(value)) throw new TypeError("Wrong value");
		return value;
	};
	a.throws(function () { prop2.value = 'raz'; }, "Validate: invalid");
	prop2.value = 434;
	a(prop2.value, '434', "Validate: valid");
};
