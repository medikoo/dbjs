'use strict';

var Db = require('../../')

  , Base = Db.Base, ObjectType = Db.Object, BooleanType = Db.Boolean
  , StringType = Db.String, NumberType = Db.Number;

module.exports = function (t, a) {
	var obj = Db(), obj2, ns

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

	obj2.set('relInstTest4', 'raz');
	obj.relInstTest4 = 'dwa';
	obj2.relInstTest4 = undefined;
	a(obj2.relInstTest4, 'dwa', "Start at base");

	// Make sure that validateCreate is used by rel
	ns = Db.create('RelConstructionTest')
	Db.create('RelConstructionTest2', {
		revTransTest: ns.rel({ reverse: true })
	});
};
