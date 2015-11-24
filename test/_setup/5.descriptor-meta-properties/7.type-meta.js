'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, Type, value, nValue;

	a.h1("Number");
	Type = db.Number.extend("CustomNumber");
	desc.type = Type;
	obj.test = 234;
	obj._test.on('change', function (e) { event = e; });

	a.h2("Min");
	a.h3("Descriptor");
	desc.min = 1000;
	a.deep(event, { type: 'change', newValue: null, oldValue: 234,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.min = 200;
	a.deep(event, { type: 'change', newValue: 234, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('min', 1000);
	a.deep(event, { type: 'change', newValue: null, oldValue: 234,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('min', 200);
	a.deep(event, { type: 'change', newValue: 234, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h2("Max");
	a.h3("Descriptor");
	desc.max = 220;
	a.deep(event, { type: 'change', newValue: null, oldValue: 234,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.max = 300;
	a.deep(event, { type: 'change', newValue: 234, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('max', 220);
	a.deep(event, { type: 'change', newValue: null, oldValue: 234,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('max', 300);
	a.deep(event, { type: 'change', newValue: 234, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h2("Step");
	a.h3("Descriptor");
	desc.step = 10;
	a.deep(event, { type: 'change', newValue: 230, oldValue: 234,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.step = 0;
	a.deep(event, { type: 'change', newValue: 234, oldValue: 230,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h1("DateTime");
	desc.min = -Infinity;
	desc.max = Infinity;
	Type = db.DateTime.extend("CustomDateTime");
	desc.type = Type;
	obj.test = value = new Date(Date.UTC(2000, 1, 1, 4));
	event = null;

	a.h2("Min");
	a.h3("Descriptor");
	desc.min = Date.UTC(2001, 1, 1);
	a.deep(event, { type: 'change', newValue: null, oldValue: value,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.min = Date.UTC(1999, 1, 1);
	a.deep(event, { type: 'change', newValue: value, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('min', Date.UTC(2001, 1, 1));
	a.deep(event, { type: 'change', newValue: null, oldValue: value,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('min', Date.UTC(1999, 1, 1));
	a.deep(event, { type: 'change', newValue: value, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h2("Max");
	a.h3("Descriptor");
	desc.max = Date.UTC(2000, 0, 1);
	a.deep(event, { type: 'change', newValue: null, oldValue: value,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.max = Date.UTC(2010, 0, 1);
	a.deep(event, { type: 'change', newValue: value, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('max', Date.UTC(2000, 0, 1));
	a.deep(event, { type: 'change', newValue: null, oldValue: value,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('max', Date.UTC(2010, 0, 1));
	a.deep(event, { type: 'change', newValue: value, oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h2("Step");
	a.h3("Descriptor");
	desc.step = 1000 * 60 * 60 * 24;
	nValue = obj.test;
	a.deep(event, { type: 'change', newValue: nValue, oldValue: value,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.step = 0;
	a.deep(event, { type: 'change', newValue: value, oldValue: nValue,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('step', 1000 * 60 * 60 * 24);
	nValue = obj.test;
	a.deep(event, { type: 'change', newValue: nValue, oldValue: value,
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('step', 0);
	a.deep(event, { type: 'change', newValue: value, oldValue: nValue,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h1("String");
	desc.min = -Infinity;
	desc.max = Infinity;
	Type = db.String.extend("CustomString");
	desc.type = Type;
	obj.test = 'foobar';
	event = null;
	obj._test.on('change', function (e) { event = e; });

	a.h2("Min");
	a.h3("Descriptor");
	desc.min = 10;
	a.deep(event, { type: 'change', newValue: null, oldValue: 'foobar',
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.min = 2;
	a.deep(event, { type: 'change', newValue: 'foobar', oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('min', 10);
	a.deep(event, { type: 'change', newValue: null, oldValue: 'foobar',
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('min', 2);
	a.deep(event, { type: 'change', newValue: 'foobar', oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h2("Max");
	a.h3("Descriptor");
	desc.max = 5;
	a.deep(event, { type: 'change', newValue: null, oldValue: 'foobar',
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.max = 100;
	a.deep(event, { type: 'change', newValue: 'foobar', oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('max', 5);
	a.deep(event, { type: 'change', newValue: null, oldValue: 'foobar',
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('max', 100);
	a.deep(event, { type: 'change', newValue: 'foobar', oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h2("Pattern");
	a.h3("Descriptor");
	desc.pattern = /^marko$/;
	a.deep(event, { type: 'change', newValue: null, oldValue: 'foobar',
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	desc.pattern = /^foobar$/;
	a.deep(event, { type: 'change', newValue: 'foobar', oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;

	a.h3("Namespace");
	Type.set('pattern', /^marko$/);
	a.deep(event, { type: 'change', newValue: null, oldValue: 'foobar',
		dbjs: event.dbjs, target: obj._test }, "Restrict");
	event = null;
	Type.set('pattern', /^foobar$/);
	a.deep(event, { type: 'change', newValue: 'foobar', oldValue: null,
		dbjs: event.dbjs, target: obj._test }, "Ease");
	event = null;
};
