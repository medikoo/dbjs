'use strict';

var Base = require('../lib/types/base');

module.exports = function (t, a) {

	a(t, Base.Object, "Object");
	a(t.Boolean._id_, 'Boolean', "Boolean");
	a(t.DateTime._id_, 'DateTime', "DateTime");
	a(t.Number._id_, 'Number', "Number");
	a(t.RegExp._id_, 'RegExp', "RegExp");
	a(t.String._id_, 'String', "String");

	a(t().db, t, "Access to main database from instance");
	a.deep(t.Set('raz', 'dwa').values.sort(), ['raz', 'dwa'].sort(),
		"Set library");
};
