'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj1, obj2, obj3, set;

	obj1 = new db.Object({ foo: 'awa' });
	obj2 = new db.Object({ foo: 'bwa' });

	a.deep(toArray(db.Object.instances), [obj1, obj2], "Instances");
	set = db.Object.filterByKey('foo', 'bwa');
	a.deep(toArray(set), [obj2], "Initial");

	obj3 = new db.Object({ foo: 'bwa' });

	a.deep(toArray(set), [obj2, obj3], "Create");

	obj1.foo = 'bwa';
	a.deep(toArray(set), [obj1, obj2, obj3], "Update: add");

	obj2.foo = 'bwdfd';
	a.deep(toArray(set), [obj1, obj3], "Update: remove");

	obj2.foo = 'bwa';
	a.deep(toArray(set), [obj1, obj2, obj3], "Update same property twice");

	obj2.set('bar', 'marko');
	a.deep(toArray(set.filterByKey('bar', 'marko')), [obj2], "Deep filterByKey");

	a(db.Object.instances.first, obj1, "First");
};
