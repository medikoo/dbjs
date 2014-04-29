'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj1, obj2, obj3, obj4, obj5, set;

	obj1 = new db.Object({ foo: 'raz', bar: 'elo' });
	obj2 = new db.Object({ foo: 'raz', bar: 'elo' });
	obj3 = new db.Object({ foo: 'raz', bar: 'elod' });
	obj4 = new db.Object({ foo: 'bla', bar: 'elo' });

	set = db.Object.find('foo', 'raz').filterByKey('bar', 'elo');
	a.deep(toArray(set), [obj1, obj2], "Initial");

	obj5 = new db.Object({ foo: 'raz', bar: 'elo' });

	a.deep(toArray(set), [obj1, obj2, obj5], "Create");

	obj3.bar = 'elo';
	a.deep(toArray(set), [obj1, obj2, obj5, obj3], "Fix key");

	obj4.foo = 'raz';
	a.deep(toArray(set), [obj1, obj2, obj5, obj3, obj4], "Fix find");

	obj2.foo = 'bwa';
	a.deep(toArray(set), [obj1, obj5, obj3, obj4], "Remove value");
};
