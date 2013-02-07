'use strict';

var Db = require('../../');

module.exports = function (a) {
	var obj = Db({ foo: 'bar' }), list;
	obj._foo.multiple = true;
	obj.foo.getItem('bar').order = 10;
	obj.foo.add('raz').order = 5;
	obj.foo.add('dwa').order = 20;

	list = obj.foo.list(function (a, b) {
		return obj.foo.getItem(a).order - obj.foo.getItem(b).order;
	});
	a.deep(list, ['raz', 'bar', 'dwa']);
};
