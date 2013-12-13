'use strict';

var d            = require('d/d')
  , isObservable = require('observable-value/is-observable-value')
  , Database     = require('../../../')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), protoDesc, desc
	  , prop, protoProp;

	protoDesc = db.Object.prototype.$get('foo');
	desc = obj.$get('foo');
	protoProp = protoDesc.$get('foo');
	prop = desc.$get('foo');

	a(getPrototypeOf(prop), protoProp, "Inheritance");
	a(desc.$get('foo'), prop, "Return already created");

	a(desc._getCurrentDescriptor_('foo'), prop, "Get current");
	defineProperty(desc, 'foo', d('bar'));
	a(obj._getCurrentDescriptor_('foo'), null, "Native value");

	a(isObservable(obj._getDescriptorPropertyObservable_('foo')), true,
		"Observable");
};
