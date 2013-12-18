'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), fn
	  , dateTime = new db.DateTime();

	a(t(undefined), '', "Undefined");
	a(t(null), '0', "Null");
	a(t(false), '10', "Boolean");
	a(t(-342.234), '2-342.234', "Number");
	a(t('misiek\nsdf\\raz\ndwa\\trzy'), '3misiek\\nsdf\\\\raz\\ndwa\\\\trzy',
		"String");
	a(t(fn = function () { return 'foo'; }), '6' + String(fn), "Function");
	a(t(new Date(12345)), '412345', "Date");
	a(t(dateTime), t(new Date(dateTime.getTime())), "DBJS DateTime");
	a(t(new RegExp('raz\ndwa')), '5/raz\\ndwa/', "RegExp");
	a(t(db.DateTime), '7DateTime', "Namespace");
	a(t(obj), '7' + obj.__id__, "Object");
	a(t({}), null, "Unrecognized");
};
