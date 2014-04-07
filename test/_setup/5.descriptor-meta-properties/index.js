'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test');

	a(desc.type, db.Base, "Type");
	a(desc.required, false, "Required");
	a(desc.multiple, false, "Multiple");
	a(desc.nested, false, "Nested");
	a(desc.reverse, undefined, "Reverse");
	a(desc.unique, false, "Unique");

	a.throws(function () { obj.set('_initialize_', 'foo'); }, 'INVALID_FUNCTION',
		"Function properties");
};
