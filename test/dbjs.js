'use strict';

var base = require('../lib/types/base');

module.exports = function (t, a) {
	a(t, base.Object, "Object");
	a(t.DateTime, base.DateTime, "DateTime");
	a(t.number, base.number, "Number");
	a(t.regExp, base.regExp, "RegExp");
	a(t.string, base.string, "String");
};
