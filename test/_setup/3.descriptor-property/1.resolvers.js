'use strict';

var primitiveSet = require('es5-ext/object/primitive-set')
  , d            = require('d/d')
  , isObservable = require('observable-value/is-observable-value')
  , Database     = require('../../../')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), protoDesc, desc
	  , prop, protoProp, args, i, x = {};

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

	a.h1("forEachOwnDescriptor");
	db.Base.prototype.$get('foo').set('raz', 'dwa');
	desc.set('miszka', 'raz');

	args = primitiveSet('foo', 'miszka');
	i = 0;
	desc._forEachOwnDescriptor_(function (desc, key) {
		if (!args[key]) {
			a.never();
			return;
		}
		delete args[key];
		++i;
		a(desc._sKey_, key, "Descriptor #" + i);
		a(this, x, "Context #" + i);
	}, x);
	a(keys(args).length, 0, "All processed");
};
