'use strict';

var d        = require('d/d')
  , Database = require('../../../')

  , defineProperty = Object.defineProperty;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, desc, event, prop;

	desc = proto.$getOwn('test');
	prop = desc.$getOwn('foo');

	// Resolve value
	a.h1("Undefined");
	a(desc.foo, undefined);
	a(desc._has_('foo'), false, "Has value");

	// Value
	a.h1("Value");
	desc.foo = 23;
	a(desc.foo, 23);
	event = desc._getPropertyLastEvent_('foo');
	a(event.object, prop, "Event");
	a(desc._has_('foo'), true, "Has value");

	// Null
	a.h1("Null");
	desc.foo = null;
	a(desc.foo, null);
	event = desc._getPropertyLastEvent_('foo');
	a(event.object, prop, "Event");
	a(desc._has_('foo'), true, "Has value");

	a.h1();
	a(desc._getPropertyLastModified_('foo'), event.stamp, "Last modified");

	defineProperty(prop, 'type', d('', db.String));
	a(desc._normalize_('foo', 23), '23', "Normalize");
};
