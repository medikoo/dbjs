'use strict';

var Base       = require('../../lib/types-base/base')
  , ObjectType = require('../../lib/types-base/object')
  , StringType = require('../../lib/types-base/string');

module.exports = function (a) {
	var ns, ns2, prop, prop2, data, events;

	ns = Base.abstract('Reltest',
		 { foo: StringType.rel({ required: true, value: 'mario' }) });

	prop = ns._foo;
	a(prop.obj, ns, "Object");
	a(prop.name, 'foo', "Name");

	a(prop.value, 'mario', "Value");
	a(prop.ns, StringType, "Namespace");
	a(prop.required, true, "Property");

	ns2 = ns.abstract('Reltest2');
	ns2.foo = 123;

	prop2 = ns2._foo;
	a(prop2.obj, ns2, "Extended: Object");
	a(prop2.name, 'foo', "Extended: Name");
	a(prop2.value, '123', "Extended: Normalized");
	a(prop2._value, '123', "Extended: Saved normalized");

	prop.ns = null;
	a(prop.ns, Base, "Set namespace to null");
	prop.ns = StringType;
	a(prop.ns, StringType, "Bring back specific namespace");
	prop.ns = undefined;
	a(prop.ns, Base, "Undefine namespace");

	a(prop2.value, '123', "Removed namespace: Not changed extended value");
	prop2.value = 345;
	a(prop2.value, 345, "Removed namespace: Set value");

	prop.ns = StringType;
	a(prop.ns, StringType, "Readded namespace: Namespace");
	a(prop2.value, '345', "Readded namespace: Value normalized");
	a(prop2._value, 345, "Readded namespace: Original value intact");

	ns2.foo = function () { return 15; };
	a(ns2.foo, '15', "Getter");
	ns2.foo = function () {};
	a(ns2.foo, null, "Getter: null");

	ns2.foo = function (x) { return [this, x]; };
	a.deep(ns2.foo(23), [ns2, 23], "Function");

	ns.set('lorem', StringType.rel({ writeOnce: true }));
	ns.lorem = 'ipsum';
	a.throws(function () {
		ns.lorem = 'else';
	}, "Write once");

	ns.set('anomiszka', Base.rel('value'));
	data = [];
	ns._anomiszka._forEachObject_(function () { data.push(arguments); });
	a(data.length, 1, "ForEach: Count");
	a.deep(data[0], [ns._anomiszka._ns, ns._anomiszka._ns._id_, ns._anomiszka],
		"ForEach: Content");

	data = ObjectType({ foo: 'raz', lorem: 'dwa', other: 'pięć',
		trzy: StringType.rel({
			value: function () { return this.foo + '|' + this.lorem; },
			triggers: ['foo', 'lorem']
		})});

	events = [];
	data._trzy.on('update', function () { events.push(arguments); });
	a(data.trzy, 'raz|dwa', "Triggered Getter: value");

	a(events.length, 0, "Triggered Getter: get doesn't event");

	data.foo = 'marko';
	a(events.length, 1, "Triggered Getter: Set #1");
	a.deep(events[0], ['marko|dwa', 'raz|dwa'], "Triggered Getter: Set #1: Args");
	a(data.trzy, 'marko|dwa', "Triggered Getter: Set #1: value");
	events.length = 0;

	data.other = 'else';
	a(events.length, 0, "Triggered Getter: Set Other");
	a(data.trzy, 'marko|dwa', "Triggered Getter: Set Other: value");

	data.lorem = 'emka';
	a(events.length, 1, "Triggered Getter: Set #2");
	a.deep(events[0], ['marko|emka', 'marko|dwa'],
		"Triggered Getter: Set #2: Args");
	a(data.trzy, 'marko|emka', "Triggered Getter: Set #2: value");
};
