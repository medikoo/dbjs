'use strict';

var toArray  = require('es6-iterator/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, desc1, desc2;

	a.throws(function () { desc.type = {}; }, 'INVALID_TYPE', "Type validation");
	desc.type = db.String;

	obj.test = 234;
	a(obj.test, '234', "Normalization");
	obj._test.on('change', function (e) { event = e; });
	desc.type = db.Number;
	a.deep(event, { type: 'change', newValue: 234, oldValue: '234',
		dbjs: event.dbjs }, "Force udpate");

	a.h1("Assignments");
	desc1 = (new db.Object()).$getOwn('test');
	desc2 = (new db.Object()).$getOwn('foo');

	a.deep(toArray(db.DateTime._typeAssignments_), [], "Initial");

	desc1.type = db.DateTime;
	desc2.type = db.DateTime;

	a.deep(toArray(db.DateTime._typeAssignments_), [desc1, desc2],
		"After");

	desc1.type = db.Boolean;
	a.deep(toArray(db.DateTime._typeAssignments_), [desc2], "Change type #1");
	a.deep(toArray(db.Boolean._typeAssignments_), [desc1], "Change type #1");
	desc1.delete('type');
	a.deep(toArray(db.Boolean._typeAssignments_), [], "Change type #1");
};
