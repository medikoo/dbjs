'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, Type;

	Type = db.Number.extend("CustomNumber");
	desc.type = Type;
	obj.test = 234;
	obj._test.on('change', function (e) { event = e; });

	Type.set('min', 1000);
	a.deep(event, { type: 'change', newValue: null, oldValue: 234,
		dbjs: event.dbjs }, "Restrict");
	event = null;
	Type.set('min', 200);
	a.deep(event, { type: 'change', newValue: 234, oldValue: null,
		dbjs: event.dbjs }, "Ease");
	event = null;
};
