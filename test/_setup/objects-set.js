'use strict';

var Database = require('../../');

module.exports = function (T, a) {
	var db = new Database(), obj1 = new db.Object({ bar: 'miszka' }), obj2 = new db.Object()
	  , set = new T(), i, arr, x = {};

	set._add(obj1);
	set._add(obj2);

	a(set.getById(obj1.__id__), obj1, "getById");
	a.h1("plainForEach");
	i = 0;
	arr = [obj1, obj2];
	set._plainForEach_(function (obj) {
		var index = arr.indexOf(obj);
		a.h2(String(i++));
		a(index !== -1, true, "Object");
		arr.splice(index, 1);
		a(this, x, "Context");
	}, x);

	a.h1("Some");
	a(db.Object.instances.filterByKey('bar', 'miszka').some(function () {
		return true;
	}), true);
};
