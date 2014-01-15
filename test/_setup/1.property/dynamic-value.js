'use strict';

var toArray         = require('es6-iterator/to-array')
  , isObservableSet = require('observable-set/is-observable-set')
  , Database        = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , event, observable;

	obj.set('raz', 1);
	obj.set('dwa', 2);
	obj.set('trzy', 3);

	proto.set('test', function () { return this.raz + this.dwa + this.trzy; });

	observable = obj._test;
	a(observable.value, 6, "Observable");

	observable.on('change', function (e) {
		event = e;
		delete event.dbjs;
	});
	obj.raz = 3;
	a.deep(event, { type: 'change', newValue: 8, oldValue: 6 }, "Update value");
	event = null;

	proto.test = function () { return this.raz - this.dwa; };
	a.deep(event, { type: 'change', newValue: 1, oldValue: 8 }, "Update getter");
	event = null;

	obj.trzy = 5;
	a(event, null, "Unreferenced, no trigger");

	obj.define('multiTest', {
		type: db.String,
		multiple: true,
		value: function () { return ['raz', 'dwa']; }
	});

	a.h1("Multiple dynamic");
	a(isObservableSet(obj._multiTest.value), true, "Type");
	a.deep(toArray(obj._multiTest.value), ['raz', 'dwa'], "Content");
};
