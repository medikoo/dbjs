'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), event = null;

	obj.count = 0;
	obj.set('test', function (_observe
/**/) {
		var value;
		++this['count']; //jslint: ignore
		if (this.allow) value = _observe(this._foo);
		else value = _observe(this._bar);

		value += this.morda(8);
		value += this.all;
		return value;
	});

	obj.set('allow', true);
	obj.set('foo', 10);
	obj.set('bar', 20);
	obj.set('all', 5);
	Object.defineProperty(obj, 'morda', { value: function (x) {
		return this.foo + x;
	} });

	a(obj.count, 0, "Init");

	a.h1("Not observable");
	a(obj.test, 33);
	a(obj.count, 1, "Count");

	a.h1("Observable");
	obj._test.on('change', function (e) { event = e; });
	a(obj.count, 2, "Count");

	a.h1("Change not effective");
	obj.bar = 30;
	a(obj.count, 2, "Count");
	a(event, null, "Event");

	a.h1("Change effective");
	obj.foo = 12;
	a(obj.count, 3, "Count");
	a.deep(event, { type: 'change', newValue: 37, oldValue: 33,
		dbjs: event.dbjs }, "Event");
	event = null;

	a.h1("Change observables");
	obj.allow = false;
	a(obj.count, 4, "Count");
	a.deep(event, { type: 'change', newValue: 55, oldValue: 37,
		dbjs: event.dbjs }, "Event");
	event = null;

	a.h1("Change not effective");
	obj.foo = 16;
	a(obj.count, 4, "Count");
	a(event, null, "Event");

	a.h1("Change effective #2");
	obj.bar = 28;
	a(obj.count, 5, "Count");
	a.deep(event, { type: 'change', newValue: 57, oldValue: 55,
		dbjs: event.dbjs }, "Event");
};
