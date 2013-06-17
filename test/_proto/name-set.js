'use strict';

var Db = require('../../');

module.exports = function (T, a, d) {
	var set = new T({}), x = {}, values, i = 0, obj, list;
	a.deep(set.values, [], "Empty");
	set[set._serialize('foo')] = 'foo';
	set[set._serialize('bar')] = 'bar';
	a.deep(set.values.sort(), ['bar', 'foo'], "Filled");
	values = set.values;

	set.forEach(function (name, index, self) {
		a(name, values[i], "Name #" + i);
		a(index, null, "Index #" + i);
		a(self, set, "Set #" + i);
		a(this, x, "Context #" + i);
		++i;
	}, x);

	obj = new Db({ raz: 1, dwa: 2, trzy: 3 });
	obj._raz.order = 10;
	obj._dwa.order = 12;
	obj._trzy.order = -5;
	list = obj.getOwnPropertyNames().listByOrder();
	a.deep(list, ['trzy', 'raz', 'dwa'], "By Order: init");
	obj._raz.order = 20;
	setTimeout(function () {
		a.deep(list, ['trzy', 'dwa', 'raz'], "By Order: update");
		obj.set('cztery', 12);
		setTimeout(function () {
			a.deep(list, ['trzy', 'cztery', 'dwa', 'raz'], "By Order: add");
			obj.set('dwa');
			setTimeout(function () {
				a.deep(list, ['trzy', 'cztery', 'raz'], "By Order: delete");
				obj.set('dwa');
				a(list, obj.getOwnPropertyNames().listByOrder(), "Memoized");
				d();
			}, 10);
		}, 10);
	}, 10);
};
