'use strict';

var Db = require('../../');

module.exports = function (a) {
	var obj = Db({ foo: 'bar' }), list, raz, bar, dwa;
	obj._foo.multiple = true;
	bar = obj.foo.getItem('bar');
	bar.order = 10;
	raz = obj.foo.add('raz');
	raz.order = 5;
	dwa = obj.foo.add('dwa');
	dwa.order = 20;

	list = obj.foo.list(function (a, b) {
		return obj.foo.getItem(a).order - obj.foo.getItem(b).order;
	});
	a.deep(list, ['raz', 'bar', 'dwa']);

	list = obj.foo.itemsList(function (a, b) {
		return a.order - b.order;
	});
	a.deep(list, [raz, bar, dwa], "Items");

	list = obj.foo.listByOrder();
	a.deep(list, ['raz', 'bar', 'dwa'], "ByOrder");
	a(list, obj.foo.listByOrder(), "ByOrder: Memoize");

	list = obj.foo.itemsListByOrder();
	a.deep(list, [raz, bar, dwa], "ItemsByOrder");
	a(list, obj.foo.itemsListByOrder(), "ItemsByOrder: Memoize");
};
