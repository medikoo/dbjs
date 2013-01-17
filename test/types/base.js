'use strict';

var Db        = require('../../')
  , serialize = require('../../lib/utils/serialize')

  , Base = Db.Base, DateTime = Db.DateTime

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (t, a) {
	var ns = t.create('BaseTest');

	a(t._id_, 'Base', "Id");
	a(t.Base, t, "Exposed on self");
	a(t.call, Function.prototype.call, "Function prototype methods");
	return {
		"Create": function (a) {
			var ns0, ns1;

			a.throws(function () {
				t.create('0sdfs');
			}, "Name: Digit first");
			a.throws(function () {
				t.create('sdsdfs');
			}, "Name: No capital");
			a.throws(function () {
				t.create('Raz dwa');
			}, "Name: Inner space");
			a.throws(function () {
				t.create('_foo');
			}, "Name: Underscore");

			ns0 = t.create('Createtest0', { trzy: DateTime.required });
			a.throws(function () { ns0.create('Createtest1', { trzy: 'foo' }); },
				"Validate");
			ns0.create('Createtest2', {});
			ns0.create('Createtest3');

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
				other: 14
			}, {
				foo: 'raz'
			});

			a(ns1.other, 14, "Namespace property");
			a(ns1.prototype.foo, 'raz', "Prototype property");
			a(ns1.prototype.ns, ns1, "NS property");

			ns1 = t.create('Test3', {});
			a(t.Test3, ns1, "Set on Base");
			a(ns1._id_, 'Test3', "Id");
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
			var ns1 = Db.create('Prototest1')
			  , ns2 = Db.create('Prototest2')
			  , ns3 = ns1.create('Prototest3')

			  , obj;

			ns3.$$setValue(ns2);
			a(getPrototypeOf(ns3), ns2, "Constructor");
			a(getPrototypeOf(ns3.prototype), ns2.prototype, "Prototype");

			ns3.$$setValue();
			a(getPrototypeOf(ns3), Base, "Constructor");
			a(getPrototypeOf(ns3.prototype), Base.prototype, "Prototype");
			a(Base.hasOwnProperty('Prototest3'), false);

			ns2.set('indtest', Db.String);

			obj = Db({ indtest: 'foo' });
			obj.$$setValue(ns2.prototype);

			a.deep(ns2.prototype._indtest.find('foo').values, [obj], "Indexes");
		},
		"Serialize": function (a) {
			a(t._serialize_(true), serialize(true), "#1");
			a(t._serialize_(343), serialize(343), "#2");
			a(t._serialize_('foo'), serialize('foo'), "#3");
		}
	};
};
