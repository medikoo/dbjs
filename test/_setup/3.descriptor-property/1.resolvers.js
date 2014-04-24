'use strict';

var primitiveSet = require('es5-ext/object/primitive-set')
  , d            = require('d')
  , isObservable = require('observable-value/is-observable-value')
  , Database     = require('../../../')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), protoDesc, desc
	  , prop, protoProp, args, i, x = {};

	protoDesc = db.Object.prototype.$getOwn('foo');
	desc = obj.$getOwn('foo');
	protoProp = protoDesc.$getOwn('foo');
	prop = desc.$getOwn('foo');

	a(getPrototypeOf(prop), protoProp, "Inheritance");
	a(desc.$getOwn('foo'), prop, "Return already created");

	a(desc._getCurrentDescriptor_('foo'), prop, "Get current");
	defineProperty(desc, 'foo', d('bar'));
	a(desc._getCurrentDescriptor_('foo'), null, "Native value");

	a(isObservable(obj._getDpObservable_('foo')), true, "Observable");

	a.h1("forEachOwnDescriptor");
	db.Base.prototype.$getOwn('foo').set('raz', 'dwa');
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
		a(desc.key, key, "Descriptor #" + i);
		a(this, x, "Context #" + i);
	}, x);
	a(keys(args).length, 0, "All processed");
};
