'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , event, observable, item;

	proto.$getOwn('test').multiple = true;
	observable = obj.test._get('trzy');
	a(observable.value, false, "Initial");
	observable.on('change', function (e) { event = e; });

	obj.test = ['raz', 2, 'trzy', 3];

	a.h1("Set multiple");
	a(observable.value, true, "Value");
	a.deep(event, { type: 'change', newValue: true, oldValue: false,
		dbjs: event.dbjs, target: observable }, "Event");

	item = obj.test.$getOwn('trzy');
	a(observable.lastModified, item.lastModified, "Last modified");

	a.h1("Delete");
	event = null;
	obj.test.delete('trzy');
	a.deep(event, { type: 'change', newValue: false, oldValue: true,
		dbjs: event.dbjs, target: observable }, "Event");
	a(observable.value, false, "Value");

	a.h1("Add");
	event = null;
	obj.test.add('trzy');
	a.deep(event, { type: 'change', newValue: true, oldValue: false,
		dbjs: event.dbjs, target: observable }, "Event");

	a(observable.lastModified, event.dbjs.stamp, "Evented last modified");
};
