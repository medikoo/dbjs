'use strict';

var d        = require('d/d')
  , Database = require('../../../')

  , defineProperty = Object.defineProperty;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , desc, ownDesc, event, prop, ownProp;

	desc = proto.$getOwn('test');
	ownDesc = obj.$test;
	prop = desc.$getOwn('foo');
	ownProp = ownDesc.$getOwn('foo');

	// Resolve value
	a.h1("Undefined");
	a(desc.foo, undefined);
	a(ownProp._hasValue_(), false, "Has value");

	// Value
	a.h1("Value");
	desc.foo = 23;
	a(desc.foo, 23);
	event = ownProp._lastEvent_;
	a(event.object, prop, "Event");
	a(ownProp._hasValue_(), true, "Has value");

	// Null
	a.h1("Null");
	desc.foo = null;
	a(desc.foo, null);
	event = ownProp._lastEvent_;
	a(event.object, prop, "Event");
	a(ownProp._hasValue_(), true, "Has value");

	a.h1();
	a(ownProp.lastModified, event.stamp, "Last modified");

	defineProperty(prop, 'type', d('', db.String));
	a(prop._normalizeValue_(23), '23', "Normalize");
};
