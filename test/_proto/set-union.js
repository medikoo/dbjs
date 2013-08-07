'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var obj, set, set1, set2, event;
	obj = new Db({ raz: 0, dwa: 2, trzy: 3, cztery: 5 });
	set1 = obj.getOwnPropertyNames().filter(function (name, onupdate) {
		return this[name] % 2;
	});
	set2 = obj.getOwnPropertyNames().filter(function (name, onupdate) {
		return this[name] > 1;
	});
	set = set1.union(set2);
	a.deep(set.values.sort(), ['dwa', 'trzy', 'cztery'].sort(), "Union");

	obj.raz = 4;
	set.once('add', function (e) { event = e; });
	set2._update('raz', true);
	a.deep(set.values.sort(), ['raz', 'dwa', 'trzy', 'cztery'].sort(), "Add");
	a(event, 'raz', "Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.trzy = 1;
	set1._update('trzy', false);
	set2._update('trzy', false);
	a.deep(set.values.sort(), ['raz', 'dwa', 'cztery'].sort(), "Delete");
	a(event, 'trzy', "Delete: Event");
};
