'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , Db     = require('../')
  , Event  = require('../lib/event');

module.exports = function (t, a) {
	return {
		"": function () {
			var obj = new Db(), objHistory = t[obj._id_];
			a(objHistory.length, 1, "Length");
			a.deep(objHistory[0], { stamp: objHistory[0].stamp, obj: obj,
				value: Db.prototype, index: objHistory[0].index, fulfilled: true },
				"Event");
		},
		lastModified: function (a) {
			var obj = new Db();
			a(typeof obj._lastModified_, 'number', "Object");
			a(typeof Db.create('ProtoIndexTest')._lastModified_, 'number',
				"Constructor");
		},
		lastModifiedDate: function (a) {
			var date = new Date(Date.now() - 1000)
			  , obj = new Db()
			  , lm = obj._lastModifiedDate_;
			a(isDate(lm), true, "Date type");
			a(lm > date, true, "Current #1");
			date.setTime(Date.now() + 1000);
			a(lm < date, true, "Current #2");
		},
		lastEvent: function (a) {
			var obj = new Db(), event = obj._lastEvent_;
			a.deep({ obj: obj, value: Db.prototype, stamp: event.stamp,
				index: event.index, fulfilled: true }, event);
		},
		Snapshot: function (a) {
			t._snapshot().forEach(function (event, index) {
				a(event instanceof Event, true, "event #" + index);
			});
		}
	};
};
