'use strict';

var d        = require('d/d')
  , Database = require('../../../')

  , defineProperty = Object.defineProperty;

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), count = 0
	  , event = null;

	defineProperty(obj, 'miszka', d(true));
	obj.set('test', function (_observe) {
		var value;
		++count;
		if (this.allow && this.miszka) value = _observe(this._foo);
		else value = _observe(this._bar);

		value += this.all;
		return value;
	});

	obj.set('allow', true);
	obj.set('foo', 10);
	obj.set('bar', 20);
	obj.set('all', 5);

	a(count, 0, "Init");

	a.h1("Not observable");
	a(obj.test, 15);
	a(count, 1, "Count");

	a.h1("Observable");
	obj._test.on('change', function (e) { event = e; });
	a(count, 2, "Count");

	a.h1("Change not effective");
	obj.bar = 30;
	a(count, 2, "Count");
	a(event, null, "Event");

	a.h1("Change effective");
	obj.foo = 12;
	a(count, 3, "Count");
	a.deep(event, { type: 'change', newValue: 17, oldValue: 15,
		dbjs: event.dbjs }, "Event");
	event = null;

	a.h1("Change observables");
	obj.allow = false;
	a(count, 4, "Count");
	a.deep(event, { type: 'change', newValue: 35, oldValue: 17,
		dbjs: event.dbjs }, "Event");
	event = null;

	a.h1("Change not effective");
	obj.foo = 14;
	a(count, 4, "Count");
	a(event, null, "Event");

	a.h1("Change effective");
	obj.bar = 28;
	a(count, 5, "Count");
	a.deep(event, { type: 'change', newValue: 33, oldValue: 35,
		dbjs: event.dbjs }, "Event");
};
