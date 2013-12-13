'use strict';

var isDate   = require('es5-ext/date/is-date')
  , Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), fn = function () { return 'foo'; }, x;
	a(t('', db.objects), undefined, "Undefined");
	a(t('0', db.objects), null, "Null");
	a(t('11', db.objects), true, "Boolean");
	a(t('2-342.234', db.objects), -342.234, "Number");
	a(t('3misiek\\nsdf\\\\raz\\ndwa\\\\trzy', db.objects),
		'misiek\nsdf\\raz\ndwa\\trzy', "String");
	a(typeof (x = t('6' + String(fn), db.objects)), 'function', "Function: type");
	a(String(x).indexOf('return \'foo\';') > -1, true, "Function: content");
	a(isDate(x = t('412345', db.objects)), true, "Date: type");
	a(x.getTime(), 12345, "Date: value");
	a(t('5/foo$/g', db.objects).test('foo'), true, "RegExp");
	a(t('7DateTime', db.objects), db.DateTime, "Namespace");
	a.throws(function () { t('923', db.objects); }, TypeError, "Invalid value");
};
