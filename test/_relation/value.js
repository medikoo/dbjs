'use strict';

var Db = require('../../')

  , Base = Db.Base, StringType = Db.String;

module.exports = function (a) {
	var obj = Db(), obj2;

	// Basic set
	obj.set('relValueTest', 'bar');
	a(obj._relValueTest.value, 'bar', "Relation: value");
	a(obj._relValueTest.required, false, "Relation: required");
	a(obj._relValueTest.ns, Base, "Relation: namespace");
	a(obj.relValueTest, 'bar', "Value");
	a(obj.hasOwnProperty('relValueTest'), true, "Own");

	// Inheritance
	obj2 = obj.$$create('relValueTest1');
	a(obj2.relValueTest, 'bar', "Inherited: Value");
	a(obj2.hasOwnProperty('relValueTest'), false, "Inherited: Own");
	obj2.relValueTest = 'foo';
	a(obj2.relValueTest, 'foo', "Inherited: Set");
	a(obj2.hasOwnProperty('relValueTest'), true, "Inherited: Set: Own");
	obj2.relValueTest = undefined;
	a(obj2.relValueTest, 'bar', "Inherited: Delete");
	a(obj2.hasOwnProperty('relValueTest'), false, "Inherited: Delete: Own");

	// Getter
	obj2._defineRel_('relValueTest2');
	obj2.relValueTest2 = function () { return this.relValueTest + 'foo'; };
	a(obj2.relValueTest2, 'barfoo', "Getter");
	obj2.relValueTest2 = function () {};
	a(obj2.relValueTest2, null, "Getter: null");

	// Function
	obj2.relValueTest2 = function (x) { return [this, x]; };
	a.deep(obj2.relValueTest2(23), [obj2, 23], "Function");

	// WriteOnce
	obj.set('relValueTest3', StringType.rel({ writeOnce: true }));
	obj.relValueTest3 = 'ipsum';
	a.throws(function () {
		obj.relValueTest3 = 'else';
	}, "Write once");
};
