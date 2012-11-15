'use strict';

require('../../lib/types/boolean');

module.exports = function (t, a) {
	var ns = t.create('simpletest', {
		validate: function (value) { return value; },
		normalize: function (value) { return value; }
	});

	a(t.__id, 'root', "Id");
	return {
		"Create": function (a) {
			var ns1;

			a.throws(function () {
				t.abstract('0sdfs');
			}, "Name: Digit first");
			a.throws(function () {
				t.abstract('raz dwa');
			}, "Name: Inner space");
			a.throws(function () {
				t.abstract('_foo');
			}, "Name: Underscore");

			a.throws(function () { t.create('test21', {}); },
				"Completeness");

			ns1 = t.create('test22', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; },
				other: 14
			}, {
				foo: 'raz'
			});

			a(ns1.other, 14, "Namespace property");
			a(ns1.prototype.foo, 'raz', "Prototype property");

			ns1 = t.create('test3', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; }
			});
			a(t.test3, ns1, "Set on base");
			a(ns1.__id, 'test3', "Id");
		},
		"Rel": function (a) {
			ns.set('relprop', t.boolean.rel());
			a(ns.relprop, undefined, "No data: value");
			a(ns._relprop.ns, ns.boolean, "No data: namespace");

			ns.set('relprop2', ns.boolean.rel({ value: true, required: true }));
			a(ns.relprop2, true, "Data: value");
		}
	};
};
