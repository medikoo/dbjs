'use strict';

var Db = require('../../');

module.exports = function (t, a, d) {
	var obj, set, evented = 0, list, compareFn, map, mapEvented = 0, mapFn;
	obj = Db({ raz: 20, dwa: 10, trzy: 31 });
	set = obj.getOwnPropertyNames();
	list = set.list(compareFn = function (a, b) { return this[a] - this[b]; });
	a.deep(list, ['dwa', 'raz', 'trzy'], "Initial sort");

	map = list.liveMap(mapFn = function (x) { return x.toUpperCase(); });
	a.deep(map, ['DWA', 'RAZ', 'TRZY'], "Map: Initial");

	list.on('change', function () { ++evented; });
	map.on('change', function () { ++mapEvented; });

	obj.raz = 5;
	list._sort();
	obj.trzy = 3;
	list._sort();

	a(evented, 0, "Update scheduled for next-tick");
	a(mapEvented, 0, "Map: Update scheduled for next-tick");

	setTimeout(function () {
		a(evented, 1, "Update: Emit");
		evented = 0;
		a.deep(list, ['trzy', 'raz', 'dwa'], "Update: Order");
		a(mapEvented, 1, "Map: Update: Emit");
		mapEvented = 0;
		a.deep(map, ['TRZY', 'RAZ', 'DWA'], "Map: Update: Order");

		obj.raz = 6;
		setTimeout(function () {
			a(evented, 0, "Update (no order change): Emit");
			evented = 0;
			a.deep(list, ['trzy', 'raz', 'dwa'], "Update (no order change): Order");
			a(mapEvented, 0, "Map: Update (no order change): Emit");
			mapEvented = 0;
			a.deep(map, ['TRZY', 'RAZ', 'DWA'],
				"Map: Update (no order change): Order");

			obj.set('cztery', 8);
			setTimeout(function () {
				a(evented, 1, "Add: emit");
				evented = 0;
				a.deep(list, ['trzy', 'raz', 'cztery', 'dwa'], "Add: Order");
				a(mapEvented, 1, "Map: Add: Emit");
				mapEvented = 0;
				a.deep(map, ['TRZY', 'RAZ', 'CZTERY', 'DWA'],
					"Map: Add: Order");

				obj.raz = undefined;
				setTimeout(function () {
					a(evented, 1, "Delete: emit");
					evented = 0;
					a.deep(list, ['trzy', 'cztery', 'dwa'], "Delete: Order");
					a(mapEvented, 1, "Map: Delete: Emit");
					mapEvented = 0;
					a.deep(map, ['TRZY', 'CZTERY', 'DWA'],
						"Map: Delete: Order");

					a(list, set.list(compareFn), "Memoized");
					a(map, list.liveMap(mapFn), "Map: Memoized");
					d();
				}, 10);
			}, 10);
		}, 10);
	}, 10);
};
