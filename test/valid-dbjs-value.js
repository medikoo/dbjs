'use strict';

var Database = require('../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), value
	  , dateTime = new db.DateTime();

	a(t(undefined), undefined, "Undefined");
	a(t(null), null, "Null");
	a(t(false), false, "Boolean");
	a(t(-342.234), -342.234, "Number");
	a(t('misiek\nsdf\\raz\ndwa\\trzy'), 'misiek\nsdf\\raz\ndwa\\trzy', "String");
	a(t(value = function () { return 'foo'; }), value, "Function");
	a(t(value = new Date(12345)), value, "Date");
	a(t(dateTime), dateTime, "DBJS DateTime");
	a(t(value = new RegExp('raz\ndwa')), value, "RegExp");
	a(t(db.DateTime), db.DateTime, "Namespace");
	a(t(obj), obj, "Object");
	a.throws(function () { t({}); }, TypeError, "Unrecognized");
};
