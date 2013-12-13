'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = { foo: 23 };

	a(t(obj, function () { return this.foo + 10; }, true, db.String), '33',
		"Getter");
	a(t(obj, function () { return this.foo + 10; }, true, db.String, { min: 3 }),
		null, "Getter + Desc");
	a(t(obj, '34', false, db.Number), 34, "Static");
	a(t(obj, '34', false, db.Number, { step: 10 }), 30, "Static + Desc");
};
