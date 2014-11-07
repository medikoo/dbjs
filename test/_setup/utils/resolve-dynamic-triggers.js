'use strict';

var aFrom    = require('es5-ext/array/from')
  , Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), event = null;

	obj.count = 0;
	obj.set('test', function (_observe) {
		var value;
		++this['count']; //jslint: ignore
		if (this.allow) value = _observe(this._foo);
		else value = _observe(this._bar);

		if (this.allow) value += 1;
		value += this.all;
		return value;
	});

	obj.set('allow', true);
	obj.set('foo', 10);
	obj.set('bar', 20);
	obj.set('all', 5);

	a(obj.count, 0, "Init");

	a.h1("Not observable");
	a(obj.test, 16);
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
	a.deep(event, { type: 'change', newValue: 18, oldValue: 16,
		dbjs: event.dbjs, target: obj._test }, "Event");
	event = null;

	a.h1("Change observables");
	obj.allow = false;
	a(obj.count, 4, "Count");
	a.deep(event, { type: 'change', newValue: 35, oldValue: 18,
		dbjs: event.dbjs, target: obj._test }, "Event");
	event = null;

	a.h1("Change not effective");
	obj.foo = 14;
	a(obj.count, 4, "Count");
	a(event, null, "Event");

	a.h1("Change effective");
	obj.bar = 28;
	a(obj.count, 5, "Count");
	a.deep(event, { type: 'change', newValue: 33, oldValue: 35,
		dbjs: event.dbjs, target: obj._test }, "Event");

	a.h1("Dupe double proof");
	obj.all = 10;
	a(obj.count, 6, "Count");
	a.deep(event, { type: 'change', newValue: 38, oldValue: 33,
		dbjs: event.dbjs, target: obj._test }, "Event");

	a.h1("Reactivity after normal access");
	db.Object.prototype.defineProperties({
		list: {
			multiple: true
		},
		computedList: {
			multiple: true,
			value: function () {
				return this.list.copy();
			}
		},
		nonReactive: {
			value: function () {
				var name = 'computedList';
				return this[name];
			}
		},
		reactive: {
			multiple: true,
			value: function () {
				return this.computedList.copy();
			}
		}
	});

	obj = new db.Object();
	obj.get('computedList');
	obj.list.add('foo');
	a.deep(aFrom(obj._reactive.value), ['foo']);
};
