'use strict';

var isObservableValue = require('observable-value/is-observable-value')
  , Database          = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , event, observable;

	obj.set('raz', 1);

	observable = obj._raz;
	a(observable.value, 1, "Observable");
	a(isObservableValue(observable), true, "Observable value");

	a(observable.lastModified, obj._getPropertyLastModified_(proto.$raz._sKey_),
		"Initial last modified");
	observable.on('change', function (e) {
		event = e;
	});
	observable.value = 13;
	a.deep(event, { type: 'change', newValue: 13, oldValue: 1,
		dbjs: event.dbjs, target: observable }, "Event");

	a(observable.lastModified, event.dbjs.stamp, "Evented last modified");
	a(obj.raz, 13, "Value");

	a(observable._lastModified.value, event.dbjs.stamp,
		"Last modified observable");
	obj.raz = 14;
	a(observable._lastModified.value, obj.$raz._lastOwnEvent_.stamp,
		"Last modified observable: Update");
};
