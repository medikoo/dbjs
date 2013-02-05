'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var ns, obj, set, event;
	ns = Db.create('NameSetTest', { foo: 1, bar: 'dwa' });
	obj = ns({ raz: 1, dwa: 2 });
	set = obj.getPropertyNames();
	a.deep(set.values.sort(), ['foo', 'bar', 'raz', 'dwa'].sort(), "Init");

	set.once('add', function (e) { event = e; });
	ns.prototype.set('else', true);
	a.deep(set.values.sort(), ['foo', 'bar', 'raz', 'dwa', 'else'].sort(),
			"Parent: Add");
	a(event, 'else', "Parent: Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	ns.prototype.foo = undefined;
	a.deep(set.values.sort(), ['bar', 'raz', 'dwa', 'else'].sort(),
			"Parent: Delete");
	a(event, 'foo', "Parent: Delete: Event");

	event = null;
	set.once('add', function (e) { event = e; });
	obj.set('piec', 5);
	a.deep(set.values.sort(), ['bar', 'raz', 'dwa', 'else', 'piec'].sort(),
			"Obj: Add");
	a(event, 'piec', "Obj: Add: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj.dwa = undefined;
	a.deep(set.values.sort(), ['bar', 'raz', 'else', 'piec'].sort(),
			"Obj: Delete");
	a(event, 'dwa', "Obj: Delete: Event");

	a(set, obj.getPropertyNames(), "Memoized");
};
