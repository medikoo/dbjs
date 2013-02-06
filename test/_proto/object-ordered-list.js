'use strict';

var Db = require('../../');

module.exports = function (t, a, d) {
	var obj, set, evented = 0, list, compareFn;
	obj = Db({ raz: 20, dwa: 10, trzy: 31 });
	set = obj.getOwnPropertyNames();
	list = set.list(compareFn = function (a, b) { return this[a] - this[b]; });
	a.deep(list, ['dwa', 'raz', 'trzy'], "Initial sort");

	list.on('change', function () { ++evented; });

	obj.raz = 5;
	list._sort();
	obj.trzy = 3;
	list._sort();

	a(evented, 0, "Update scheduled for next-tick");

	setTimeout(function () {
		a(evented, 1, "Update: Emit");
		evented = 0;
		a.deep(list, ['trzy', 'raz', 'dwa'], "Update: Order");

		obj.raz = 6;
		setTimeout(function () {
			a(evented, 0, "Update (no order change): Emit");
			evented = 0;
			a.deep(list, ['trzy', 'raz', 'dwa'], "Update (no order change): Order");

			obj.set('cztery', 8);
			setTimeout(function () {
				a(evented, 1, "Add: emit");
				evented = 0;
				a.deep(list, ['trzy', 'raz', 'cztery', 'dwa'], "Add: Order");

				obj.raz = undefined;
				setTimeout(function () {
					a(evented, 1, "Delete: emit");
					evented = 0;
					a.deep(list, ['trzy', 'cztery', 'dwa'], "Delete: Order");
					a(list, set.list(compareFn), "Memoized");
					d();
				}, 10);
			}, 10);
		}, 10);
	}, 10);
};
