'use strict';

var Db = require('../../')

  , StringType = Db.String;

module.exports = function (a) {
	var data, events, Otype;

	// Getter
	data = new Db({ foo: 'raz', lorem: 'dwa', other: 'pięć', other2: 'six',
		trzy: StringType.rel({
			value: function (_observe) {
				return this.foo + '|' + _observe(this._lorem) + '|' +
					_observe(this._other);
			},
			triggers: ['foo']
		}) });

	events = [];
	data._trzy.on('change', function () { events.push(arguments); });
	a(data.trzy, 'raz|dwa|pięć', "Triggered Getter: value");

	a(events.length, 0, "Triggered Getter: get doesn't event");

	data.foo = 'marko';
	a(events.length, 1, "Triggered Getter: Set #1");
	a.deep(events[0], ['marko|dwa|pięć', 'raz|dwa|pięć'],
		"Triggered Getter: Set #1: Args");
	a(data.trzy, 'marko|dwa|pięć', "Triggered Getter: Set #1: value");
	events.length = 0;

	data.other2 = 'else';
	a(events.length, 0, "Triggered Getter: Set Other");
	a(data.trzy, 'marko|dwa|pięć', "Triggered Getter: Set Other: value");

	data.lorem = 'emka';
	a(events.length, 1, "Triggered Getter: Set #2");
	a.deep(events[0], ['marko|emka|pięć', 'marko|dwa|pięć'],
		"Triggered Getter: Set #2: Args");
	a(data.trzy, 'marko|emka|pięć', "Triggered Getter: Set #2: value");
	events.length = 0;

	data.lorem = 'hula';
	a(events.length, 1, "Triggered Getter: Set #3");
	a.deep(events[0], ['marko|hula|pięć', 'marko|emka|pięć'],
		"Triggered Getter: Set #3: Args");
	a(data.trzy, 'marko|hula|pięć', "Triggered Getter: Set #3: value");
	events.length = 0;

	data.other = 'ejja';
	a(events.length, 1, "Triggered Getter: Set #4");
	a.deep(events[0], ['marko|hula|ejja', 'marko|hula|pięć'],
		"Triggered Getter: Set #4: Args");
	a(data.trzy, 'marko|hula|ejja', "Triggered Getter: Set #4: value");
	events.length = 0;

	Otype = Db.create('OtypeGetter', { trzy: StringType.rel({
		value: function (_observe) { return this.foo + '|' + _observe(this._lorem) +
			'|' + _observe(this._other); },
		triggers: ['foo']
	}) });

	data = new Otype({ foo: 'raz', lorem: 'dwa', other: 'pięć', other2: 'six' });

	data._trzy.on('change', function () { events.push(arguments); });
	a(data.trzy, 'raz|dwa|pięć', "Triggered proto Getter: value");

	a(events.length, 0, "Triggered proto Getter: get doesn't event");

	data.foo = 'marko';
	a(events.length, 1, "Triggered proto Getter: Set #1");
	a.deep(events[0], ['marko|dwa|pięć', 'raz|dwa|pięć'],
		"Triggered proto Getter: Set #1: Args");
	a(data.trzy, 'marko|dwa|pięć', "Triggered proto Getter: Set #1: value");
	events.length = 0;

	data.other2 = 'else';
	a(events.length, 0, "Triggered proto Getter: Set Other");
	a(data.trzy, 'marko|dwa|pięć', "Triggered proto Getter: Set Other: value");

	data.lorem = 'emka';
	a(events.length, 1, "Triggered proto Getter: Set #2");
	a.deep(events[0], ['marko|emka|pięć', 'marko|dwa|pięć'],
		"Triggered proto Getter: Set #2: Args");
	a(data.trzy, 'marko|emka|pięć', "Triggered proto Getter: Set #2: value");
	events.length = 0;

	data.lorem = 'hula';
	a(events.length, 1, "Triggered proto Getter: Set #3");
	a.deep(events[0], ['marko|hula|pięć', 'marko|emka|pięć'],
		"Triggered proto Getter: Set #3: Args");
	a(data.trzy, 'marko|hula|pięć', "Triggered proto Getter: Set #3: value");
	events.length = 0;

	data.other = 'ejja';
	a(events.length, 1, "Triggered proto Getter: Set #4");
	a.deep(events[0], ['marko|hula|ejja', 'marko|hula|pięć'],
		"Triggered proto Getter: Set #4: Args");
	a(data.trzy, 'marko|hula|ejja', "Triggered proto Getter: Set #4: value");
	events.length = 0;

};
