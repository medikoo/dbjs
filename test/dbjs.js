'use strict';

var base = require('../lib/base');

module.exports = function (t, a) {
	var ns;
	a(t, base.object, "Object");
	a(t.boolean, base.boolean, "Boolean");
	a(t.dateTime, base.dateTime, "dateTime");
	a(t.function, base.function, "Function");
	a(t.number, base.number, "Number");
	a(t.regExp, base.regExp, "RegExp");
	a(t.string, base.string, "String");

	ns = base.create('othertest');
	a(t.othertest, ns, "Newly created namespace");
};
