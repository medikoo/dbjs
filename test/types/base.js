'use strict';

module.exports = function (t) {
	var ns = t.create('simpletest', {
		validate: function (value) { return value; },
		normalize: function (value) { return value; }
	});

	return {
		"Create": function (a) {
			var ns2, ns1, x;

			a.throws(function () {
				ns.create('0sdfs');
			}, "Name: Digit first");
			a.throws(function () {
				ns.create('raz dwa');
			}, "Name: Inner space");
			a.throws(function () {
				ns.create('_foo');
			}, "Name: Underscore");

			a(ns('bar'), 'bar', "Constructor: Clone by default");
			ns2 = ns.create('test12', function (value) { return 'lorem' + value; });
			a(ns2('ipsum'), 'loremipsum', "Constructor");

			a.throws(function () { t.create('test21', {}); },
				"Completeness");

			ns1 = t.create('test22', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; },
				other: x
			}, {
				foo: 'raz'
			});

			a(ns1.other, x, "Namespace property");
			a(ns1.prototype.foo, 'raz', "Prototype property");

			ns1 = t.create('test3', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; }
			});
			a(t.test3, ns1, "Set on base");
			a(ns1.__id, 'test3', "Id");
		},
		"Abstract": function (a) {
			var ns2 = t.abstract('abstracttest', { foo: 'bar' });

			a(t.abstracttest, ns2, "Created");
			a(ns2.foo, 'bar', "Property set");
		},
		"Rel": function (a) {
			ns.set('relprop', t.boolean.rel());
			a(ns.relprop, undefined, "No data: value");
			a(ns._relprop.ns, ns.boolean, "No data: namespace");

			ns.set('relprop2', ns.boolean.rel({ value: true, required: true }));
			a(ns.relprop2, true, "Data: value");
		},
		"Set": function (a) {
			a.throws(function () {
				ns.set('_foo', 'whatever');
			}, "Bad property name");

			ns.set('one', ns.boolean.rel({ value: true, required: true }));
			a(ns.one, true, "");
			ns.one = false;
			a(ns.one, false, "Update");
		},
		"SetMany": function (a) {
			var fn = function () {};
			ns.setMany({
				dwa: ns.boolean.rel({ value: true, required: true }),
				trzy: fn
			});
			a(ns.dwa, true, "#1");
			a(ns.trzy, fn, "#2");
		}
	};
};
