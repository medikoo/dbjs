'use strict';

var Db = require('../../')

  , StringType = Db.String;

module.exports = function (t, a) {
	var obj = Db(), rel = obj._getRel_('simpleTest'), obj2, obj3, fn;

	obj2 = obj.$$create('simpleTestObj');
	t(rel, obj2);

	obj2.simpleTest = 'bar';
	a(obj2._simpleTest.value, 'bar', "Relation: value");
	a(obj2._simpleTest.name, 'simpleTest', "Relation: name");
	a(obj2._simpleTest.obj, obj2, "Relation: object");
	a(obj2._simpleTest.ns, Db.Base, "Relation: namespace");
	a(obj2.simpleTest, 'bar', "Value");
	a(obj2.hasOwnProperty('simpleTest'), true, "Own");

	obj3 = obj2.$$create('simpleTestObj2');
	a(obj3.simpleTest, 'bar', "Value: inherited");
	a.not(obj3._simpleTest, obj2.simpleTest, "Relation: not inherited");
	a(obj3.hasOwnProperty('simpleTest'), false, "Inherited not own");

	obj3.simpleTest = 'other';
	a(obj3.simpleTest, 'other', "Value: written");
	a(obj2.simpleTest, 'bar', "Value: not overriden");
	a(obj3._simpleTest.value, 'other', "Relation: written");
	a(obj3.hasOwnProperty('simpleTest'), true, "Inherited but own");

	obj3.simpleTest = undefined;
	a(obj3.simpleTest, 'bar', "Value: Delete");
	a(obj3.hasOwnProperty('simpleTest'), false, "Value: Delete: Own");

	obj2.simpleTest = fn = function () {};
	a(obj2.simpleTest, fn, "Function value");
	obj2._simpleTest.multiple = true;
	a.throws(function () {
		obj2.simpleTest = [1, 2];
	}, "Multiple");
};
