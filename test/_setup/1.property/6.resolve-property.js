'use strict';

var isSet    = require('es6-set/is-set')
  , toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , desc, ownDesc, fn, event, pDesc, obj2;

	desc = proto.$getOwn('test');
	ownDesc = obj.$test;

	a(obj._lastEvent_.object, obj, "Last Event");

	// Resolve value
	a.h1("Undefined");
	a(obj.test, undefined);
	a(obj._resolveGetter_(desc._sKey_), null, "Desc getter");
	a(obj._getPropertyLastEvent_(desc._sKey_), null, "Event");
	a(obj._has_(desc._sKey_), false, "Has value");

	obj.set('test', fn = function () { return 'ID: ' + this.__id__; });

	a.h1("Nested");
	desc.nested = true;
	a(typeof obj.test, 'object');
	a(obj._resolveGetter_(desc._sKey_), null, "Desc getter");
	event = obj._getPropertyLastEvent_(desc._sKey_);
	a(event && event.object, desc.$nested, "Event");
	a(obj._has_(desc._sKey_), true, "Has value");

	a.h1("Nested By Proto");
	obj2 = new db.Object();
	pDesc = obj2._descriptorPrototype_;
	pDesc.nested = true;
	pDesc.type = db.Object;
	a(obj2.get('foo').__id__, obj2.__id__ + '/foo', "Value");
	a(obj2._hasOwn_('foo'), true, "Has own");
	a(obj2._has_('foo'), true, "Has value");

	a.h1("Getter");
	desc.nested = false;
	a(obj.test, 'ID: ' + obj.__id__);
	a(obj._resolveGetter_(desc._sKey_), fn, "Desc getter");
	event = obj._getPropertyLastEvent_(desc._sKey_);
	a(event.object, ownDesc, "Event");
	a(obj._has_(desc._sKey_), true, "Has value");

	// Value
	a.h1("Value");
	obj.test = 23;
	a(obj.test, 23);
	a(obj._resolveGetter_(desc._sKey_), null, "Desc getter");
	event = obj._getPropertyLastEvent_(desc._sKey_);
	a(event.object, ownDesc, "Event");
	a(obj._has_(desc._sKey_), true, "Has value");

	// Multiple
	a.h1("Multiple");
	desc.multiple = true;
	a(isSet(obj.test), true);
	event = obj._getPropertyLastEvent_(desc._sKey_);
	a(event.object, desc.$multiple, "Event");
	a(obj._has_(desc._sKey_), true, "Has value");

	// Multiple getter
	a.h1("Multiple getter");
	obj.test = fn = function () { return ['raz', 23, 'dwa']; };
	a(isSet(obj.test), true);
	a(obj._resolveGetter_(desc._sKey_), fn, "Desc getter");
	a.deep(toArray(obj.test), ['raz', 23, 'dwa'], "Content");
	event = obj._getPropertyLastEvent_(desc._sKey_);
	a(event.object, desc.$multiple, "Event");
	a(obj._has_(desc._sKey_), true, "Has value");

	// Null
	a.h1("Null");
	desc.multiple = false;
	obj.test = null;
	a(obj.test, null);
	event = obj._getPropertyLastEvent_(desc._sKey_);
	a(event.object, ownDesc, "Event");
	a(obj._has_(desc._sKey_), true, "Has value");

	a.h1();

	desc.type = db.String;
	a(obj._normalize_(desc._sKey_, 23), '23', "Normalize");
};
