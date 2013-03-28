'use strict';

var Db        = require('../../')
  , getObject = require('../../lib/objects')._get
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

			  , obj1, obj2;

			ns3._signal_(ns2);
			a(getPrototypeOf(ns3), ns2, "Constructor");
			a(getPrototypeOf(ns3.prototype), ns2.prototype, "Prototype");

			ns3._signal_();
			a(getPrototypeOf(ns3), Base, "Constructor");
			a(getPrototypeOf(ns3.prototype), Base.prototype, "Prototype");
			a(Base.hasOwnProperty('Prototest3'), false);

			ns2.set('indtest', Db.String);

			obj1 = Db({ indtest: 'foo' });
			obj1._signal_(ns2.prototype);

			a.deep(ns2.prototype._indtest.find('foo').values, [obj1], "Indexes");

			obj1 = Db({ valueTest: 'foo' });
			obj2 = Db({ valueTest2: ns2 });
			obj2._valueTest2.$$setValue(obj1);
			a(obj2.valueTest2, null, "Value: Before");
			obj1._signal_(ns2.prototype);
			a(obj2.valueTest2, obj1, "Value: After");
		},
		"Proto: index handling": function (a) {
			var ns1 = Db.create('IndexObjRelTest1')
			  , ns2 = Db.create('IndexObjRelTest2',
					{ foo: ns1 })
			  , obj, obj1, obj2;
			obj = getObject('51vpsfr080s');
			obj2 = getObject('01vo3s3m6wa');
			obj2.foo = obj;
			obj2.$$setValue(ns2.prototype);
			a(obj2.foo, null, "Invalid cleared");
			obj1 = ns1();
			obj2.foo = obj1;
			a(obj2.foo, obj1, "Assign good");
		},
		"Proto: index handling multiple": function (a) {
			var ns1 = Db.create('IndexObjRelTest3')
			  , ns2 = Db.create('IndexObjRelTest4',
					{ bar: ns1.rel({ multiple: true }) })
			  , item, obj1, obj2;
			item = getObject('91s43q0tlhb:bar:791s43pq2s7b"');
			item.$$setValue(true);
			obj2 = getObject('91s43q0tlhb');
			obj2.$$setValue(ns2.prototype);
			a.deep(obj2.bar.values, [], "Invalid cleared");
			obj1 = ns1();
			obj2.bar = [obj1];
			a.deep(obj2.bar.values, [obj1], "Assigned");
		},
		"Proto: index handling multiple: false": function (a) {
			var ns1 = Db.create('IndexObjRelTest5')
			  , ns2 = Db.create('IndexObjRelTest6',
					{ bar: ns1.rel({ multiple: true }) })
			  , obj11, obj12, obj2;
			obj11 = ns1();
			obj12 = ns1();
			obj2 = ns2();
			obj2.bar.add(obj11);
			obj2.bar.delete(obj11);
			obj2.bar.getItem(obj12);
			obj2.$$setValue();
			a(obj2._bar.multiple, false, "");
		},
		"Proto: Multiple handling": function () {
			var obj, emitted, ns = Db.create('MultipleObjRelTest1',
				{ foo: Db.String.rel({ multiple: true }) });

			obj = Db({ foo: 'raz' });
			obj._foo.once('change', function (nu, old) {
				emitted = [nu, old];
			});
			obj.$$setValue(ns.prototype);
			a.deep(emitted, [obj._foo, 'raz']);
		},
		"Serialize": function (a) {
			a(t._serialize_(true), serialize(true), "#1");
			a(t._serialize_(343), serialize(343), "#2");
			a(t._serialize_('foo'), serialize('foo'), "#3");
		},
		"Delete": function (a) {
			var ns = Db.create('DelTest')
			  , obj = ns()
			  , item;

			obj.get('foo').value = 'marko';
			obj.get('raz').multiple = true;
			obj.raz = ['dwa', 'trzy'];
			item = obj._raz.getItem('dwa');
			obj.delete();
			a(obj.ns, Db.Base, "");
			a(obj.foo, undefined, "Relation");
			a(obj._raz.multiple, false, "Relation: Relation");
			a(obj._raz.propertyIsEnumerable(item._key_), false, "Item");
		}
	};
};
