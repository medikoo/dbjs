'use strict';

var base = require('../lib/types/base');

module.exports = function (t, a) {

	a(t, base.Object, "Object");
	a(t.boolean._id_, 'boolean', "Boolean");
	a(t.DateTime._id_, 'DateTime', "DateTime");
	a(t.number._id_, 'number', "Number");
	a(t.RegExp._id_, 'RegExp', "RegExp");
	a(t.string._id_, 'string', "String");

	a(t().db, t, "Access to main database from instance");
	a.deep(t.Set('raz', 'dwa').values.sort(), ['raz', 'dwa'].sort(),
		"Set library");
};
