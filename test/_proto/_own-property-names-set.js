'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var obj, set, event;
	obj = Db();
	set = new t(obj);
	a.deep(set.values, [], "Empty");
	obj.set('foo', null);
	a.deep(set.values, [], "No ns property");
	set.once('add', function (e) { event = e; });
	obj._foo.ns = Db.String;
	a.deep(set.values, ['foo'], "Set Ns");
	a(event, 'foo', "Event: add");
	event = null;
	set.once('remove', function (e) { event = e; });
	obj._foo.ns = null;
	a.deep(set.values, [], "Remove Ns");
	a(event, 'foo', "Event: remove");
	obj.foo = 'bar';
	a.deep(set.values, ['foo'], "Set value");
};
