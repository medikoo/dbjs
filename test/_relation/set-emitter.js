'use strict';

var Db = require('../../');

module.exports = function (t, a) {
	var ns, obj, addEvents = [], deleteEvents = [];
	ns = Db.create('SetEmitterTest',
		{ foo: Db.String.rel({ multiple: true, value: ['raz', 'dwa'] }) });
	obj = ns();
	obj.foo.multiple = true;
	obj.foo.add('foo');
	obj.foo.add('bar');

	a.deep(obj.foo.values.sort(), ['raz', 'dwa', 'foo', 'bar'].sort(), "Init");

	obj.foo.on('add', function (item) { addEvents.push(item); });
	obj.foo.on('delete', function (item) { deleteEvents.push(item); });
	ns.prototype.foo._multiple._signal_(false);
	a.deep(obj.foo.values.sort(), ['foo', 'bar'].sort(), "Hide");
	a.deep(addEvents, [], "Hide: Add events");
	addEvents.length = 0;
	a.deep(deleteEvents.sort(), ['raz', 'dwa'].sort(), "Hide: Delete events");
	deleteEvents.length = 0;

	ns.prototype._foo._multiple._signal_(true);
	a.deep(obj.foo.values.sort(), ['raz', 'dwa', 'foo', 'bar'].sort(), "Show");
	a.deep(addEvents.sort(), ['raz', 'dwa'].sort(), "Show: Add events");
	a.deep(deleteEvents, [], "Show: Delete events");
};
