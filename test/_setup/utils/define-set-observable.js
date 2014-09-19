'use strict';

var Set = require('es6-set/primitive')

  , create = Object.create;

module.exports = function (t, a) {
	var proto = create(Set.prototype), initialized, set, event;

	t(proto, function () { initialized = true; });

	set = create(proto);
	proto.constructor.call(set);

	set.add('foo');
	a(initialized, undefined, "Not observable");
	set.on('foo', function () {});
	a(initialized, undefined, "Not 'change' listener");
	set.on('change', function (e) { event = e; });
	a(initialized, true, "'change' listener");

	set.add('raz');
	set._emitAdd_('raz');
	a.deep(event, { type: 'add', value: 'raz', target: set }, "Event");
};
