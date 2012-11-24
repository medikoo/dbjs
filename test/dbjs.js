'use strict';

var base = require('../lib/types/base');

module.exports = function (t, a) {

	a(t, base.Object, "Object");
	a(t.boolean.__id, 'boolean', "Boolean");
	a(t.DateTime.__id, 'DateTime', "DateTime");
	a(t.number.__id, 'number', "Number");
	a(t.RegExp.__id, 'RegExp', "RegExp");
	a(t.string.__id, 'string', "String");

	a(t().db, t, "Access to main database from instance");
	a.deep(t.Set('raz', 'dwa').values.sort(), ['raz', 'dwa'].sort(),
		"Set library");
};
