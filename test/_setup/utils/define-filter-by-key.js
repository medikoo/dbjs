'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj1, obj2, obj3, obj4, obj5, set, set2, set3;

	db.Object.extend('ObjectExt');
	db.ObjectExt.prototype.define('someNested', {
		nested: true,
		type: db.Object
	});

	obj1 = new db.ObjectExt({ foo: 'raz', bar: 'elo' });
	obj1.someNested.set('mar', 'elo');
	obj2 = new db.ObjectExt({ foo: 'raz', bar: 'elo' });
	obj2.someNested.set('mar', 'elo');
	obj3 = new db.ObjectExt({ foo: 'raz', bar: 'elod' });
	obj3.someNested.set('mar', 'elso');
	obj4 = new db.ObjectExt({ foo: 'bla', bar: 'elo' });
	obj4.someNested.set('mar', 'foo');

	set = db.ObjectExt.find('foo', 'raz').filterByKey('bar', 'elo');
	set2 = db.ObjectExt.find('foo', 'raz').filterByKey('bar', 'miszka');
	set3 = db.ObjectExt.instances.filterByKeyPath('someNested/mar', 'elo');
	a.deep(toArray(set), [obj1, obj2], "Initial");
	a.deep(toArray(set3), [obj1, obj2]);

	obj5 = new db.ObjectExt({ foo: 'raz', bar: 'elo' });
	obj5.someNested.set('mar', 'elo');

	a.deep(toArray(set), [obj1, obj2, obj5], "Create");
	a.deep(toArray(set3), [obj1, obj2, obj5]);
	a.deep(toArray(set2), [], "Create #2");

	obj3.bar = 'elo';
	a.deep(toArray(set), [obj1, obj2, obj5, obj3], "Fix key");
	obj3.someNested.mar = 'elo';
	a.deep(toArray(set3), [obj1, obj2, obj5, obj3]);
	a.deep(toArray(set2), [], "Fix key #2");

	obj4.foo = 'raz';
	a.deep(toArray(set), [obj1, obj2, obj5, obj3, obj4], "Fix find");
	obj4.someNested.mar = 'elo';
	a.deep(toArray(set3), [obj1, obj2, obj5, obj3, obj4]);
	a.deep(toArray(set2), [], "Fix find #2");

	obj2.foo = 'bwa';
	a.deep(toArray(set), [obj1, obj5, obj3, obj4], "Remove value");
	obj2.someNested.mar = 'sdfs';
	a.deep(toArray(set3), [obj1, obj5, obj3, obj4]);
	a.deep(toArray(set2), [], "Remove value #2");

	obj5.bar = 'miszka';
	a.deep(toArray(set2), [obj5], "Add value to #2");
};
