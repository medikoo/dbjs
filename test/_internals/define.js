'use strict';

var Base         = require('../../lib/types/base')
  , BooleanType  = require('../../lib/types/boolean')
  , NumberType   = require('../../lib/types/number')
  , StringType   = require('../../lib/types/string')
  , ObjectType   = require('../../lib/types/object')

  , ns = Base.abstract('Definetest');

module.exports = function (t, a) {
	var ns2, obj;

	ns.set('foo', 'bar');
	a(ns._foo.value, 'bar', "Relation: value");
	a(ns._foo.required, true, "Relation: required");
	a(ns._foo.ns, StringType, "Relation: namespace");
	a(ns.foo, 'bar', "Value");
	a(ns.hasOwnProperty('foo'), true, "Own");

	ns2 = ns.abstract('Definetest2');
	a(ns2.foo, 'bar', "Value: inherited");
	a.not(ns2._foo, ns.foo, "Relation: not inherited");

	ns2.foo = 'other';
	a(ns2.foo, 'other', "Value: written");
	a(ns.foo, 'bar', "Value: not overriden");
	a(ns2._foo.value, 'other', "Relation: written");
	a(ns2.hasOwnProperty('foo'), true, "Inherited but own");

	ns.set('other', BooleanType.rel({ value: true, required: true }));

	a(ns.other, true, "Define rel transport");

	ns.other = StringType.rel('test');
	a(ns.other, 'test', "Set rel transport");

	ns.set('trzy', ObjectType);
	a(ns._trzy.ns, ObjectType, "Namespace: ns");
	a(ns.trzy, undefined, "Namespace: value");

	ns.set('Trzy', ObjectType);
	a(ns._Trzy.ns, Base, "Namespace value: ns");
	a(ns.Trzy, ObjectType, "Namespace value: value");

	obj = new ObjectType({ foo: 'bar2' });
	a(obj._foo.value, 'bar2', "Object: Relation: value");
	a(obj._foo.required, true, "Object: Relation: required");
	a(obj._foo.ns, StringType, "Object: Relation: namespace");
	a(obj.foo, 'bar2', "Object: Value");
	a(obj.hasOwnProperty('foo'), true, "Object: Own");

	obj.set('bar', [2, 3, 43, 23]);
	a.deep(obj.bar.values, [2, 3, 43, 23], "Auto namespace for multiple: Value");
	a(obj._bar.ns, NumberType, "Auto namespace for multiple: Namespace");

	obj.set('bar2', [2, 3, 'fefe', 23]);
	a.deep(obj.bar2.values, [2, 3, 'fefe', 23],
		"Auto namespace for multiple: Multi type: Value");
	a(obj._bar2.ns, Base, "Auto namespace for multiple: Multi type: Namespace");
};
