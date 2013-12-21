'use strict';

var Database = require('../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), dateTime = new db.DateTime();

	a(t(undefined), true, "Undefined");
	a(t(null), true, "Null");
	a(t(false), true, "Boolean");
	a(t(-342.234), true, "Number");
	a(t('misiek\nsdf\\raz\ndwa\\trzy'), true, "String");
	a(t(function () { return 'foo'; }), true, "Function");
	a(t(new Date(12345)), true, "Date");
	a(t(dateTime), true, "DBJS DateTime");
	a(t(new RegExp('raz\ndwa')), true, "RegExp");
	a(t(db.DateTime), true, "Namespace");
	a(t(obj), true, "Object");
	a(t({}), false, "Unrecognized");
};
