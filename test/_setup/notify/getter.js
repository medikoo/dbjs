'use strict';

var isSet    = require('es6-set/is-set')
  , toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , event, observable, desc, set;

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
	a.deep(event, { type: 'change', newValue: 8, oldValue: 6, target: observable }, "Update value");
	event = null;

	proto.test = function () { return this.raz - this.dwa; };
	a.deep(event, { type: 'change', newValue: 1, oldValue: 8, target: observable }, "Update getter");
	event = null;

	obj.trzy = 5;
	a(event, null, "Unreferenced, no trigger");

	desc = proto.$getOwn('test');
	desc.multiple = true;
	proto.test = function () { return [this.raz, this.dwa, this.trzy]; };

	set = obj.test;
	a(isSet(set), true, "Set");
	a.deep(toArray(obj.test), [3, 2, 5], "Value");

	event = null;
	set.on('change', function (e) {
		event = e;
		delete event.dbjs;
	});
	obj.raz = 3;
	a.deep(event, null, "No update");
	obj.raz = 5;
	a.deep(event, { type: 'delete', value: 3, target: set }, "Add event");
};
