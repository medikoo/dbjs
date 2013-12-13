'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$get('test')
	  , event, nObj, obj2;

	desc.type = db.Object;
	obj2 = new db.Object();
	obj.test = obj2;
	desc.nested = true;
	nObj = obj.test;
	a(db.Object.is(nObj), true, "Nested");

	obj._test.on('change', function (e) { event = e; });
	desc.nested = false;
	a.deep(event, { type: 'change', newValue: obj2, oldValue: nObj,
		dbjs: event.dbjs }, "Force udpate");
	a(obj.test, obj2, "Nested: false");
};
