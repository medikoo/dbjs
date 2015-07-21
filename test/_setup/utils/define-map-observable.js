'use strict';

var Map = require('es6-map/primitive')

  , create = Object.create;

module.exports = function (t, a) {
	var proto = create(Map.prototype), initialized, map, event;

	t(proto, function () { initialized = true; });

	map = create(proto);
	map = proto.constructor.call(map);

	map.set('foo', 'bar');
	a(initialized, undefined, "Not observable");
	map.on('foo', function () {});
	a(initialized, undefined, "Not 'change' listener");
	map.on('change', function (e) { event = e; });
	a(initialized, true, "'change' listener");

	map.set('raz', 'dwa');
	map._emitSet_('raz', 'dwa');
	a.deep(event, { type: 'set', key: 'raz', value: 'dwa', target: map }, "Event");
};
