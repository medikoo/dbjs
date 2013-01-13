'use strict';

var Db = require('../');

module.exports = function (t, a) {
	return {
		"": function () {
			var obj = Db(), objHistory = t[obj._id_];
			a(objHistory.length, 1, "Length");
			a.deep(objHistory[0], { stamp: objHistory[0].stamp, obj: obj,
				value: Db.prototype }, "Event");
		},
		lastModified: function (a) {
			var obj = Db();
			a(typeof obj._lastModified_, 'number', "Object");
			a(typeof Db.create('ProtoIndexTest')._lastModified_, 'number',
				"Constructor");
		},
		lastEvent: function (a) {
			var obj = Db(), event = obj._lastEvent_;
			a.deep({ obj: obj, value: Db.prototype, stamp: event.stamp }, event);
		}
	};
};
