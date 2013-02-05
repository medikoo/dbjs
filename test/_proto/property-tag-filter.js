'use strict';

var Db = require('../../');

module.exports = function (a) {
	var ns, obj, set, event;
	ns = Db.create('NameSetTest2', { foo: 1, bar: 'dwa' });
	ns.prototype._bar.tags = 'testfilter';
	obj = ns({ raz: 1, dwa: 2 });
	obj._raz.tags = 'testfilter';
	set = obj.getPropertyNames('testfilter');
	a.deep(set.values.sort(), ['bar', 'raz'].sort(), "Init");

	set.once('add', function (e) { event = e; });
	ns.prototype._foo.tags = 'testfilter';
	a.deep(set.values.sort(), ['foo', 'bar', 'raz'].sort(),
			"Parent: Set");
	a(event, 'foo', "Parent: Set: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	ns.prototype._bar.tags.delete('testfilter');
	a.deep(set.values.sort(), ['foo', 'raz'].sort(), "Parent: Delete");
	a(event, 'bar', "Parent: Delete: Event");

	event = null;
	set.once('add', function (e) { event = e; });
	obj._dwa.tags = 'testfilter';
	a.deep(set.values.sort(), ['foo', 'raz', 'dwa'].sort(),
			"Obj: Set");
	a(event, 'dwa', "Obj: set: Event");

	event = null;
	set.once('delete', function (e) { event = e; });
	obj._raz.tags.delete('testfilter');
	a.deep(set.values.sort(), ['foo', 'dwa'].sort(),
			"Obj: Delete");
	a(event, 'raz', "Obj: Delete: Event");

	a(set, obj.getPropertyNames('testfilter'), "Memoized");
};
