'use strict';

var Base     = require('../../lib/types/base')
  , DateTime = require('../../lib/types/date-time')
  , Plain    = require('../../lib/_internals/plain')

  , getPrototypeOf = Object.getPrototypeOf;

require('../../lib/types/boolean');

module.exports = function (t, a) {
	var ns = t.create('Simpletest');

	a(t._id_, 'Base', "Id");
	a(t.Base, t, "Exposed on self");
	return {
		"Create": function (a) {
			var ns0, ns1;

			a.throws(function () {
				t.abstract('0sdfs');
			}, "Name: Digit first");
			a.throws(function () {
				t.abstract('sdsdfs');
			}, "Name: No capital");
			a.throws(function () {
				t.abstract('Raz dwa');
			}, "Name: Inner space");
			a.throws(function () {
				t.abstract('_foo');
			}, "Name: Underscore");

			ns0 = t.create('Createtest0', { trzy: DateTime.required });
			a.throws(function () { ns0.create('Createtest1', { trzy: 'foo' }); },
				"Validate");
			a.throws(function () { ns0.create('Createtest2', {}); }, "Completeness");
			a.throws(function () { ns0.create('Createtest3'); }, "Completeness #2");

			ns0.prototype.set('foo', DateTime.required);
			a.throws(function () {
				ns0.create('Createtest4', { trzy: function () {} }, { foo: 'foo' });
			}, "Validate Prototype");

			try {
				ns0.create('Createtest5', { trzy: function () {} }, {});
				ns0.create('Createtest6', { trzy: function () {} },
					{ foo: function () {} });
			} catch (e) {
				console.log(e.subErrors);
				throw e;
			}

			ns1 = ns.create('Createtest7', { other: 15 }, { foo: 'raz' });

			a(ns1.other, 15, "Namespace property");
			a(ns1._other._value, 15, "Namespace relation");
			a(ns1.prototype.foo, 'raz', "Prototype property");
			a(ns1.prototype._foo._value, 'raz', "Prototype relation");

			ns1 = t.create('Test22', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; },
				other: 14
			}, {
				foo: 'raz'
			});

			a(ns1.other, 14, "Namespace property");
			a(ns1.prototype.foo, 'raz', "Prototype property");
			a(ns1.prototype.ns, ns1, "NS property");

			ns1 = t.create('Test3', {
				normalize: function (value) { return value; },
				validate: function (value) { return value; }
			});
			a(t.Test3, ns1, "Set on Base");
			a(ns1._id_, 'Test3', "Id");
		},
		"Abstract": function (a) {
			var ns = t.create('Abstracttest1'), ns2;
			ns.set('trzy', null);
			ns._trzy.required = true;
			ns2 = ns.abstract('Abstracttest2');
			a(ns2.trzy, null, "Abstracted");
		},
		"Rel": function (a) {
			ns.set('relprop', t.Boolean.rel());
			a(ns.relprop, undefined, "No data: value");
			a(ns._relprop.ns, ns.Boolean, "No data: namespace");

			ns.set('relprop2', ns.Boolean.rel({ value: true, required: true }));
			a(ns.relprop2, true, "Data: value");
		},
		"Required": function (a) {
			ns.set('relprop4', t.Boolean.required);
			a(ns.relprop4, undefined, "Value");
			a(ns._relprop4.ns, ns.Boolean, "Namespace");
			a(ns._relprop4.required, true, "Required");
		},
		"Proto change": function (a) {
			var ns1 = t.create('Prototest1')
			  , ns2 = t.create('Prototest2')
			  , ns3 = ns1.create('Prototest3');

			ns3.$proto(ns2);
			a(getPrototypeOf(ns3), ns2, "Constructor");
			a(getPrototypeOf(ns3.prototype), ns2.prototype, "Prototype");

			ns3.$proto();
			a(getPrototypeOf(ns3), Plain, "Constructor");
			a(getPrototypeOf(ns3.prototype), Plain.prototype, "Prototype");
			a(Base.hasOwnProperty('Prototest3'), false);
		}
	};
};
