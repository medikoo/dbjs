'use strict';

var Db = require('../../')

  , DateTime = Db.DateTime;

module.exports = function (t, a) {
	var fn, x, str;
	a(t(undefined), 'undefined', "Undefined");
	a(t(null), 'null', "Null");
	a(t(false), 'false', "Boolean");
	a(t(-342.234), '-342.234', "Number");
	a(t(str = 'misiek\nsdf\\raz\ndwa\\trzy'), JSON.stringify(str), "String");
	a(t(fn = function () { return 'foo'; }), String(fn), "Function");
	a(t(new Date(12345)), 'new Date(12345)', "Date");
	a(t(new RegExp('raz\ndwa')), '/raz\ndwa/', "RegExp");
	a(t(DateTime), 'getObject("DateTime")', "Namespace");
	a(t(x = new Db({ foo: 'bar' })), 'getObject("' + x._id_ + '")', "Object");
	a(t({}), null, "Unrecognized");
};
