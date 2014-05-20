'use strict';

var isSet    = require('es6-set/is-set')
  , toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , desc, ownDesc, fn, event;

	desc = proto.$getOwn('test');
	ownDesc = obj.$test;

	// Resolve value
	a.h1("Undefined");
	a(obj.test, undefined);
	a(ownDesc._resolveValueGetter_(), null, "Desc getter");
	a(ownDesc._resolveLastEvent_(obj), null, "Event");
	a(ownDesc._hasValue_(obj), false, "Has value");

	obj.set('test', fn = function () { return 'ID: ' + this.__id__; });

	a.h1("Nested");
	desc.nested = true;
	a(typeof obj.test, 'object');
	a(ownDesc._resolveValueGetter_(), null, "Desc getter");
	event = ownDesc._resolveLastEvent_(obj);
	a(event.object, desc.$nested, "Event");
	a(ownDesc._hasValue_(obj), true, "Has value");

	a.h1("Getter");
	desc.nested = false;
	a(obj.test, 'ID: ' + obj.__id__);
	a(ownDesc._resolveValueGetter_(), fn, "Desc getter");
	event = ownDesc._resolveLastEvent_(obj);
	a(event.object, ownDesc, "Event");
	a(ownDesc._hasValue_(obj), true, "Has value");

	// Value
	a.h1("Value");
	obj.test = 23;
	a(obj.test, 23);
	a(ownDesc._resolveValueGetter_(), null, "Desc getter");
	event = ownDesc._resolveLastEvent_(obj);
	a(event.object, ownDesc, "Event");
	a(ownDesc._hasValue_(obj), true, "Has value");

	// Multiple
	a.h1("Multiple");
	desc.multiple = true;
	a(isSet(obj.test), true);
	event = ownDesc._resolveLastEvent_(obj);
	a(event.object, desc.$multiple, "Event");
	a(ownDesc._hasValue_(obj), true, "Has value");

	// Multiple getter
	a.h1("Multiple getter");
	obj.test = fn = function () { return ['raz', 23, 'dwa']; };
	a(isSet(obj.test), true);
	a(ownDesc._resolveValueGetter_(), fn, "Desc getter");
	a.deep(toArray(obj.test), ['raz', 23, 'dwa'], "Content");
	event = ownDesc._resolveLastEvent_(obj);
	a(event.object, desc.$multiple, "Event");
	a(ownDesc._hasValue_(obj), true, "Has value");

	// Null
	a.h1("Null");
	desc.multiple = false;
	obj.test = null;
	a(obj.test, null);
	event = ownDesc._resolveLastEvent_(obj);
	a(event.object, ownDesc, "Event");
	a(ownDesc._hasValue_(obj), true, "Has value");

	a.h1();
	a(ownDesc._resolveLastModified_(obj), event.stamp, "Last modified");

	desc.type = db.String;
	a(desc._normalizeValue_(23), '23', "Normalize");

	obj.defineProperties({
		foo: { type: db.String, multiple: true },
		elo: { type: db.Number },
		bar: { type: db.Number, value: function () {
			return this.elo + this.foo.size;
		} },
		marek: { type: db.String, label: "Whatever" }
	});
	obj.elo = 3;
	a(obj.$bar._resolveLastEvent_(obj).object, obj.$elo, "Last event (getter)");

	a(obj._hasOwn_('marek'), false, "Has own for unddefined");
};
