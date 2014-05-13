'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj1, obj2, obj3, obj4, obj5, set, set2;

	obj1 = new db.Object({ foo: 'raz', bar: 'elo' });
	obj2 = new db.Object({ foo: 'raz', bar: 'elo' });
	obj3 = new db.Object({ foo: 'raz', bar: 'elod' });
	obj4 = new db.Object({ foo: 'bla', bar: 'elo' });

	set = db.Object.find('foo', 'raz').filterByKey('bar', 'elo');
	set2 = db.Object.find('foo', 'raz').filterByKey('bar', 'miszka');
	a.deep(toArray(set), [obj1, obj2], "Initial");

	obj5 = new db.Object({ foo: 'raz', bar: 'elo' });

	a.deep(toArray(set), [obj1, obj2, obj5], "Create");
	a.deep(toArray(set2), [], "Create #2");

	obj3.bar = 'elo';
	a.deep(toArray(set), [obj1, obj2, obj5, obj3], "Fix key");
	a.deep(toArray(set2), [], "Fix key #2");

	obj4.foo = 'raz';
	a.deep(toArray(set), [obj1, obj2, obj5, obj3, obj4], "Fix find");
	a.deep(toArray(set2), [], "Fix find #2");

	obj2.foo = 'bwa';
	a.deep(toArray(set), [obj1, obj5, obj3, obj4], "Remove value");
	a.deep(toArray(set2), [], "Remove value #2");

	obj5.bar = 'miszka';
	a.deep(toArray(set2), [obj5], "Add value to #2");
};
