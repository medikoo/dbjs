'use strict';

var d            = require('d/d')
  , isSet        = require('es6-set/is-set')
  , isObservable = require('observable-value/is-observable-value')
  , Database     = require('../../../')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), protoDesc, desc;

	protoDesc = db.Object.prototype.$get('foo');
	desc = obj.$get('foo');
	a(getPrototypeOf(desc), protoDesc, "Descriptor");
	a(obj.$get('foo'), desc, "Return already created");
	a(obj._getCurrentDescriptor_(protoDesc._sKey_), desc, "Get current");
	defineProperty(obj, 'foo', d('bar'));
	a(obj._getCurrentDescriptor_(protoDesc._sKey_), null, "Native value");

	a(typeof obj._getObject_(desc._sKey_), 'object', "Nested");
	a(isObservable(obj._getObservable_(desc._sKey_)), true, "Observable");
	a(isSet(obj._getDynamicMultiple_(desc._sKey_)), true, "Dynamic multiple");
};
