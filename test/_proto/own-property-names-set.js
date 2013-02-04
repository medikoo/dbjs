'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var obj, set, event;
	obj = Db();
	set = obj.getOwnPropertyNames();
	a.deep(set.values, [], "Empty");
	obj.set('foo');
	a.deep(set.values, [], "No ns property");
	set.once('add', function (e) { event = e; });
	obj._foo.ns = Db.String;
	a.deep(set.values, ['foo'], "Set Ns");
	a(event, 'foo', "Event: add");
	event = null;
	set.once('delete', function (e) { event = e; });
	obj._foo.ns = undefined;
	a.deep(set.values, [], "Remove Ns");
	a(event, 'foo', "Event: delete");
	obj.foo = 'bar';
	a.deep(set.values, ['foo'], "Set value");

	a(set, obj.getOwnPropertyNames(), "Memoized");
};
