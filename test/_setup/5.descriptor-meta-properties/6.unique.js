'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database()
	  , ObjType1 = db.Object.extend("Object1")
	  , ObjType2 = db.Object.extend("Object2")
	  , obj1 = new ObjType1()
	  , desc = ObjType1.prototype.$getOwn('test')
	  , obj2 = new ObjType2()
	  , event, Type, obj11, obj12, obj13;

	desc.type = ObjType2;
	desc.unique = true;
	desc.reverse = 'mamba';
	obj1.test = obj2;
	a(obj2.mamba, obj1, "Reverse");

	obj2._mamba.on('change', function (e) { event = e; });

	desc.unique = false;
	a.deep(event, { type: 'change', newValue: obj2.mamba, oldValue: obj1,
		dbjs: event.dbjs, target: obj2._mamba }, "Force udpate");
	a.deep(toArray(obj2.mamba), [obj1], "Unique: false");

	Type = db.Object.extend('Uniqtest1',
		{ foo: { type: db.String, unique: true, value: 'zero' } });

	obj11 = new Type({ foo: 'raz' });
	obj12 = new Type({ foo: 'dwa' });

	a.throws(function () {
		obj13 = new Type({ foo: 'dwa' });
	}, 'SET_PROPERTIES_ERROR', "Try to create unique");

	a.throws(function () {
		obj11.foo = 'dwa';
	}, 'VALUE_NOT_UNIQUE', "Try to set unique");

	obj11.foo = 'raz';
	obj12.foo = 'trzy';
	obj13 = new Type({ foo: 'dwa' });
	obj11.foo = 'cztery';

	a.throws(function () {
		obj12.foo = 'zero';
	}, 'VALUE_NOT_UNIQUE', "Unique via inherited #1");

	obj12.delete('foo');

	a.throws(function () {
		obj13.foo = 'zero';
	}, 'VALUE_NOT_UNIQUE', "Unique via inherited #2");

	a.deep(toArray(Type.find('foo', 'cztery')), [obj11], "Find");

	Type = db.Object.extend('Uniqtest2', { foo: { type: db.String, unique: true,
		value: ['zero'], multiple: true } });

	obj11 = new Type({ foo: ['raz', 'dwa'] });
	obj12 = new Type({ foo: ['trzy', 'cztery'] });

	a.throws(function () {
		obj13 = new Type({ foo: ['dwa', 'pięć'] });
	}, 'SET_PROPERTIES_ERROR', "Multiple: Set");

	a.throws(function () {
		obj11.foo.add('trzy');
	}, 'VALUE_NOT_UNIQUE', "Multiple: Add");

	obj11.foo = ['raz', 'elo'];
};
