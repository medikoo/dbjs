'use strict';

var Db = require('../../')

  , getId = function (obj) { return obj._id_; };

module.exports = function (t, a) {
	var ns, obj, relEvents = [], setEvents = [], approve = [], fragment;

	ns = Db.create('ObjFragTest', { foo: Db.String.rel({ multiple: true }) });
	obj = ns({ marko: 12,
		pablo: Db.String.rel({ multiple: true, value: ['foo', 'bar'] }) });

	fragment = new t(obj, function (rel) {
		approve.push(rel);
		return true;
	});
	fragment.on('relupdate', function (event) { relEvents.push(event.obj); });
	fragment.on('setitemupdate', function (event) {
		setEvents.push(event.obj);
	});
	fragment.init();

	a.deep(approve.map(getId).sort(), [obj._$construct, obj._$construct._ns,
		obj._marko, obj._marko._ns, obj._marko._multiple, obj._pablo,
		obj._pablo._ns, obj._pablo._multiple, obj._pablo.get('foo')._order,
		obj._pablo.get('bar')._order].map(getId).sort(), "Approve");
	approve.length = 0;
	a.deep(relEvents.map(getId).sort(), [obj._marko, obj._pablo, obj._pablo._ns,
		obj._pablo._multiple, obj._pablo.get('foo')._order,
		obj._pablo.get('bar')._order].map(getId).sort(), "Rel events");
	relEvents.length = 0;
	a.deep(setEvents.map(getId).sort(), [obj._pablo.get('foo'),
		obj._pablo.get('bar')].map(getId).sort(), "Set items");
	setEvents.length = 0;

	obj.foo.add('dwa');
	a.deep(approve.map(getId).sort(), [obj._foo,
		obj._foo._ns, obj._foo._multiple, obj._foo._unique].map(getId).sort(),
		"Add multiple: Approve");
	approve.length = 0;
	a.deep(relEvents, [], "Add multiple: Rel events");
	relEvents.length = 0;
	a.deep(setEvents.map(getId).sort(), [obj._foo.get('dwa')].map(getId).sort(),
		"Add multiple: Set items");
	setEvents.length = 0;

	obj.marko = 'raz';
	a.deep(approve, [], "Set: Approve");
	approve.length = 0;
	a.deep(relEvents, [obj._marko], "Set: Rel events");
	relEvents.length = 0;
	a.deep(setEvents, [], "Set: Set items");
	setEvents.length = 0;
};
