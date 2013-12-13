'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , event, observable;

	obj.set('raz', 1);

	observable = obj._raz;
	a(observable.value, 1, "Observable");

	a(observable.lastModified, obj._getPropertyLastModified_(proto.$raz._sKey_),
		"Initial last modified");
	observable.on('change', function (e) {
		event = e;
	});
	observable.value = 13;
	a.deep(event, { type: 'change', newValue: 13, oldValue: 1,
		dbjs: event.dbjs }, "Event");

	a(observable.lastModified, event.dbjs.stamp, "Evented last modified");
	a(obj.raz, 13, "Value");
};
