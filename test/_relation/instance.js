'use strict';

var Db = require('../../')

  , Base = Db.Base, ObjectType = Db.Object, BooleanType = Db.Boolean
  , StringType = Db.String, NumberType = Db.Number;

module.exports = function (t) {
	return {
		"": function (a) {
			var obj = new Db(), obj2, ns;

			// Basic set
			obj.set('relInstTest', 'bar');
			a(obj.relInstTest, 'bar', "Value");

			// Inheritance
			obj2 = obj.$$create('relInstTest1');
			a(obj2.relInstTest, 'bar', "Value: inherited");
			a.not(obj2._relInstTest, obj.relInstTest, "Relation: not inherited");

			obj.relInstTest = 'foo';
			a(obj2.relInstTest, 'foo', "Value: mirrored");
			obj2.relInstTest = 'other';
			a(obj2.relInstTest, 'other', "Value: written");
			a(obj.relInstTest, 'foo', "Value: not overriden");
			a(obj2._relInstTest.value, 'other', "Relation: written");

			obj._relInstTest.ns = StringType;
			obj.relInstTest = 23;
			a(obj.relInstTest, '23', "Normalization");
			a(obj._relInstTest._value, '23', "Normalization: Db value");

			obj._relInstTest.ns = NumberType;
			a(obj.relInstTest, 23, "Normalization: Type change");
			a(obj._relInstTest._value, '23', "Normalization: Type change: Db value");
			obj._relInstTest.ns = null;
			a(obj.relInstTest, '23', "Normalization: Reset NS");

			// Rel transport
			obj.set('relInstTest2', BooleanType.rel({ value: true, required: true }));
			a(obj.relInstTest2, true, "Define rel transport");

			// Namespace
			obj.set('relInstTest3', ObjectType);
			a(obj._relInstTest3.ns, ObjectType, "Namespace: ns");
			a(obj.relInstTest3, undefined, "Namespace: value");

			obj.set('RelInstTest3', ObjectType);
			a(obj._RelInstTest3.ns, Base, "Namespace value: ns");
			a(obj.RelInstTest3, ObjectType, "Namespace value: value");

			obj.RelInstTest3 = NumberType;
			a(obj.RelInstTest3, NumberType, "Namespace value: update");

			obj2.set('relInstTest4', 'raz');
			obj.relInstTest4 = 'dwa';
			obj2.relInstTest4 = undefined;
			a(obj2.relInstTest4, 'dwa', "Start at base");

			obj.set('value', 'foo');

			// Make sure that validateCreate is used by rel
			ns = Db.create('RelConstructionTest');
			Db.create('RelConstructionTest2', {
				revTransTest: ns.rel({ reverse: true })
			});
		},
		forEachRelation: function (a) {
			var obj = new Db(), data;
			obj.set('feRelTest', StringType.rel('bar'));
			obj.set('feRelTest2', 'foo');
			data = [];
			obj._forEachRelation_(function () { data.push(arguments); });
			a(data.length, 3, "Count");
			data.sort(function (a1, a2) {
				return -a2[0].name.localeCompare(a1[0].name);
			});
			a.deep(data[0], [obj._$construct, obj._$construct._id_, obj], "Item #1");
			a.deep(data[1], [obj._feRelTest, obj._feRelTest._id_, obj], "Item #2");
			a.deep(data[2], [obj._feRelTest2, obj._feRelTest2._id_, obj], "Item #2");
		}
	};
};
