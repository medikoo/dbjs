'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var ns = Db.create('PropertyFilterTest'), obj1, obj2, obj3, set, compare;

	compare = function (a, b) { return a.order - b.order; };

	obj1 = ns({ foo: 'awa', order: 1 });
	obj2 = ns({ foo: 'bwa', order: 2 });

	set = ns.filterByProperty('foo', 'bwa');
	a.deep(set.values, [obj2], "Initial");

	obj3 = ns({ foo: 'bwa', order: 3 });

	a.deep(set.values.sort(compare), [obj2, obj3], "Create");

	obj1.foo = 'bwa';
	a.deep(set.values.sort(compare), [obj1, obj2, obj3], "Update: add");

	obj2.foo = 'bwdfd';
	a.deep(set.values.sort(compare), [obj1, obj3], "Update: remove");

	obj2.foo = 'bwa';
	a.deep(set.values.sort(compare), [obj1, obj2, obj3],
		"Update same property twice");
};
