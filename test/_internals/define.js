'use strict';

var Base         = require('../../lib/types-base/base')
  , BooleanType  = require('../../lib/types-base/boolean')
  , NumberType   = require('../../lib/types-base/number')
  , StringType   = require('../../lib/types-base/string')
  , ObjectType   = require('../../lib/types-base/object')

  , ns = Base.abstract('Definetest');

module.exports = function (t, a) {
	var ns2, obj;

	ns.set('fooX', 'bar');
	a(ns._fooX.value, 'bar', "Relation: value");
	a(ns._fooX.required, true, "Relation: required");
	a(ns._fooX.ns, StringType, "Relation: namespace");
	a(ns.fooX, 'bar', "Value");
	a(ns.hasOwnProperty('fooX'), true, "Own");

	ns2 = ns.abstract('Definetest2');
	a(ns2.fooX, 'bar', "Value: inherited");
	a.not(ns2._fooX, ns.fooX, "Relation: not inherited");

	ns2.fooX = 'other';
	a(ns2.fooX, 'other', "Value: written");
	a(ns.fooX, 'bar', "Value: not overriden");
	a(ns2._fooX.value, 'other', "Relation: written");
	a(ns2.hasOwnProperty('fooX'), true, "Inherited but own");

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

	obj = new ObjectType({ fooX: 'bar2' });
	a(obj._fooX.value, 'bar2', "Object: Relation: value");
	a(obj._fooX.required, true, "Object: Relation: required");
	a(obj._fooX.ns, StringType, "Object: Relation: namespace");
	a(obj.fooX, 'bar2', "Object: Value");
	a(obj.hasOwnProperty('fooX'), true, "Object: Own");

	obj.set('barUniq', [2, 3, 43, 23]);
	a.deep(obj.barUniq.values, [2, 3, 43, 23],
		"Auto namespace for multiple: Value");
	a(obj._barUniq.ns, NumberType, "Auto namespace for multiple: Namespace");

	obj.set('barUniq2', [2, 3, 'fefe', 23]);
	a.deep(obj.barUniq2.values, [2, 3, 'fefe', 23],
		"Auto namespace for multiple: Multi type: Value");
	a(obj._barUniq2.ns, Base,
		"Auto namespace for multiple: Multi type: Namespace");

	ns2.set('whatever', 'raz');
	ns.whatever = 'dwa';
	ns2.whatever = undefined;
	a(ns2.whatever, 'dwa', "Start at base");
};
