'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var ns = Db.create('PropertyListTest'), obj1, obj2, obj3;

	obj1 = ns({ foo: 'daz' });
	obj2 = ns({ foo: 'awa' });
	obj3 = ns({ foo: 'bwa' });

	a.deep(ns.listByProperty('foo'), [obj2, obj3, obj1]);
};
