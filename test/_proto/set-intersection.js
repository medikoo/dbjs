'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var obj, set, set1, set2, event, filter;
	obj = Db({ raz: 1, dwa: 2, trzy: 3, cztery: 5 });
	set1 = obj.getOwnPropertyNames().filter(filter = function (name, onupdate) {
		return this[name] % 2;
	});
	set2 = obj.getOwnPropertyNames().filter(filter = function (name, onupdate) {
		return this[name] > 1;
	});
	set = set1.intersection(set2);
	a.deep(set.values.sort(), ['trzy', 'cztery'].sort(), "Intersection");

	obj.dwa = 7;
	set.once('add', function (e) { event = e; });
	set1._update('dwa', true);
	set2._update('dwa', true);
	a.deep(set.values.sort(), ['dwa', 'trzy', 'cztery'].sort(), "Add");
	a(event, 'dwa', "Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.trzy = 1;
	set1._update('trzy', false);
	set2._update('trzy', false);
	a.deep(set.values.sort(), ['dwa', 'cztery'].sort(), "Delete");
	a(event, 'trzy', "Delete: Event");
};
