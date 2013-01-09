'use strict';

var Db = require('../../')

  , StringType = Db.String;

module.exports = function (a) {
	var ns, ns2, prop, prop2, data, events, Otype;

	// Getter
	data = new Db({ foo: 'raz', lorem: 'dwa', other: 'pięć',
		trzy: StringType.rel({
			value: function () { return this.foo + '|' + this.lorem; },
			triggers: ['foo', 'lorem']
		}) });

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

	Otype = Db.create('Otype', { trzy: StringType.rel({
		value: function () { return this.foo + '|' + this.lorem; },
		triggers: ['foo', 'lorem']
	}) });

	data = new Otype({ foo: 'raz', lorem: 'dwa', other: 'pięć' });

	events = [];
	data._trzy.on('update', function () { events.push(arguments); });
	a(data.trzy, 'raz|dwa', "Triggered proto Getter: value");

	a(events.length, 0, "Triggered proto Getter: get doesn't event");

	data.foo = 'marko';
	a(events.length, 1, "Triggered proto Getter: Set #1");
	a.deep(events[0], ['marko|dwa', 'raz|dwa'],
		"Triggered proto Getter: Set #1: Args");
	a(data.trzy, 'marko|dwa', "Triggered proto Getter: Set #1: value");
	events.length = 0;

	data.other = 'else';
	a(events.length, 0, "Triggered proto Getter: Set Other");
	a(data.trzy, 'marko|dwa', "Triggered proto Getter: Set Other: value");

	data.lorem = 'emka';
	a(events.length, 1, "Triggered proto Getter: Set #2");
	a.deep(events[0], ['marko|emka', 'marko|dwa'],
		"Triggered proto Getter: Set #2: Args");
	a(data.trzy, 'marko|emka', "Triggered proto Getter: Set #2: value");

	Otype = Db.create('Otype1', { trzy: StringType.rel({
		value: function () { return this.foo + '|' + this.lorem; },
		triggers: ['foo', 'lorem']
	}) });

	Otype = Otype.create('Otype2');
	data = new Otype({ foo: 'raz', lorem: 'dwa', other: 'pięć' });

	events = [];
	data._trzy.on('update', function () { events.push(arguments); });
	a(data.trzy, 'raz|dwa', "Triggered deep proto Getter: value");

	a(events.length, 0, "Triggered deep proto Getter: get doesn't event");

	data.foo = 'marko';
	a(events.length, 1, "Triggered deep proto Getter: Set #1");
	a.deep(events[0], ['marko|dwa', 'raz|dwa'],
		"Triggered deep proto Getter: Set #1: Args");
	a(data.trzy, 'marko|dwa', "Triggered deep proto Getter: Set #1: value");
	events.length = 0;

	data.other = 'else';
	a(events.length, 0, "Triggered deep proto Getter: Set Other");
	a(data.trzy, 'marko|dwa', "Triggered deep proto Getter: Set Other: value");

	data.lorem = 'emka';
	a(events.length, 1, "Triggered deep proto Getter: Set #2");
	a.deep(events[0], ['marko|emka', 'marko|dwa'],
		"Triggered deep proto Getter: Set #2: Args");
	a(data.trzy, 'marko|emka', "Triggered deep proto Getter: Set #2: value");
};
