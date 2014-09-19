'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, observable;

	desc.set('raz', 1);

	observable = desc._raz;
	a(observable.value, 1, "Observable");

	a(observable.lastModified, desc._getPropertyLastModified_('raz'),
		"Initial last modified");
	observable.on('change', function (e) {
		event = e;
	});
	observable.value = 13;
	a.deep(event, { type: 'change', newValue: 13, oldValue: 1,
		dbjs: event.dbjs, target: observable }, "Event");

	a(observable.lastModified, event.dbjs.stamp, "Evented last modified");
	a(desc.raz, 13, "Value");
};
