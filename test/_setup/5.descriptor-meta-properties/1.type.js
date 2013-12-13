'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$get('test')
	  , event;

	a.throws(function () { desc.type = {}; }, 'INVALID_TYPE', "Type validation");
	desc.type = db.String;

	obj.test = 234;
	a(obj.test, '234', "Normalization");
	obj._test.on('change', function (e) { event = e; });
	desc.type = db.Number;
	a.deep(event, { type: 'change', newValue: 234, oldValue: '234',
		dbjs: event.dbjs }, "Force udpate");
};
