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
	set = set1.complement(set2);
	a.deep(set.values.sort(), ['dwa'].sort(), "Complement");

	obj.raz = 6;
	set.once('add', function (e) { event = e; });
	set1._update('raz', false);
	set2._update('raz', true);
	a.deep(set.values.sort(), ['dwa', 'raz'].sort(), "Add");
	a(event, 'raz', "Add: Event");

	event = null;
	set.once('add', function (e) { event = e; });
	obj.trzy = 4;
	set1._update('trzy', false);
	a.deep(set.values.sort(), ['dwa', 'trzy', 'raz'].sort(), "Add #2");
	a(event, 'trzy', "Add #2: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.trzy = 5;
	set1._update('trzy', true);
	a.deep(set.values.sort(), ['dwa', 'raz'].sort(), "Delete");
	a(event, 'trzy', "Delete: Event");

};
