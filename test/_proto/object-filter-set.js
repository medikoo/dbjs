'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var obj, set, event, filter;
	obj = new Db({ raz: 1, dwa: 2, trzy: 3 });
	set = obj.getOwnPropertyNames().filter(filter = function (name, onupdate) {
		return this[name] % 2;
	});
	a.deep(set.values.sort(), ['raz', 'trzy'], "Filtered");

	obj.dwa = 1;
	set.once('add', function (e) { event = e; });
	set._update('dwa', true);
	a.deep(set.values.sort(), ['raz', 'dwa', 'trzy'].sort(), "Update: Add");
	a(event, 'dwa', "Update: Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.raz = 2;
	set._update('raz', false);
	a.deep(set.values.sort(), ['dwa', 'trzy'], "Update: Delete");
	a(event, 'raz', "Update: Delete: Event");

	event = null;
	set.once('add', function (e) { event = e; });
	obj.set('piec', 5);
	a.deep(set.values.sort(), ['dwa', 'piec', 'trzy'], "Add");
	a(event, 'piec', "Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.dwa = undefined;
	a.deep(set.values.sort(), ['piec', 'trzy'], "Delete");
	a(event, 'dwa', "Delete: Event");

	a(set, obj.getOwnPropertyNames().filter(filter), "Memoized");
};
