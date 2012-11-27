'use strict';

var DateTime = require('../../lib/types/date-time');

require('../../lib/types/boolean');

module.exports = function (t, a) {
	var ns = t.create('simpletest');

	a(t.__id, 'base', "Id");
	a(t.base, t, "Exposed on self");
	return {
		"Create": function (a) {
			var ns0, ns1, ns2;

			a.throws(function () {
				t.abstract('0sdfs');
			}, "Name: Digit first");
			a.throws(function () {
				t.abstract('raz dwa');
			}, "Name: Inner space");
			a.throws(function () {
				t.abstract('_foo');
			}, "Name: Underscore");

			ns0 = t.create('createtest0', { trzy: DateTime.required });
			a.throws(function () { ns0.create({ trzy: 'foo' }); }, "Validate");
			a.throws(function () { ns0.create({}); }, "Completeness");
			a.throws(function () { ns0.create(); }, "Completeness #2");

			ns0.prototype.set('foo', DateTime.required);
			a.throws(function () {
				ns0.create('createtest1', { trzy: function () {} }, { foo: 'foo' });
			}, "Validate Prototype");

			try {
				ns0.create('createtest2', { trzy: function () {} }, {});
				ns0.create('createtest3', { trzy: function () {} },
					{ foo: function () {} });
			} catch (e) {
				console.log(e.subErrors);
				throw e;
			}

			ns1 = ns.create('createtest4', { other: 15 }, { foo: 'raz' });

			a(ns1.other, 15, "Namespace property");
			a(ns1._other._value, 15, "Namespace relation");
			a(ns1.prototype.foo, 'raz', "Prototype property");
			a(ns1.prototype._foo._value, 'raz', "Prototype relation");

			ns1 = t.create('test22', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; },
				other: 14
			}, {
				foo: 'raz'
			});

			a(ns1.other, 14, "Namespace property");
			a(ns1.prototype.foo, 'raz', "Prototype property");
			a(ns1.prototype.ns, ns1, "NS property");

			ns1 = t.create('test3', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; }
			});
			a(t.test3, ns1, "Set on base");
			a(ns1.__id, 'test3', "Id");
		},
		"Abstract": function (a) {
			var ns = t.create('abstracttest1'), ns2;
			ns.set('trzy', null);
			ns._trzy.required = true;
			ns2 = ns.abstract('abstracttest2');
			a(ns2.trzy, null, "Abstracted");
		},
		"Rel": function (a) {
			ns.set('relprop', t.boolean.rel());
			a(ns.relprop, undefined, "No data: value");
			a(ns._relprop.ns, ns.boolean, "No data: namespace");

			ns.set('relprop2', ns.boolean.rel({ value: true, required: true }));
			a(ns.relprop2, true, "Data: value");
		},
		"Required": function (a) {
			ns.set('relprop4', t.boolean.required);
			a(ns.relprop4, undefined, "Value");
			a(ns._relprop4.ns, ns.boolean, "Namespace");
			a(ns._relprop4.required, true, "Required");
		}
	};
};
