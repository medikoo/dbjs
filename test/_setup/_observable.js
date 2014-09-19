'use strict';

var Database = require('../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), event, observable;

	obj.set('raz', 1);

	observable = obj._raz;
	a(observable.value, 1, "Observable");

	observable.on('change', function (e) {
		event = e;
	});
	observable.value = 13;
	a.deep(event, { type: 'change', newValue: 13, oldValue: 1,
		dbjs: event.dbjs, target: observable }, "Event");

	a(obj.raz, 13, "Value");
};
