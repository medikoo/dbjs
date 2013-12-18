'use strict';

var isDate   = require('es5-ext/date/is-date')
  , Database = require('../../../')

  , stringify = JSON.stringify;

module.exports = function (t, a) {
	var db = new Database(), fn = function () { return 'foo'; }, x, str;
	a.throws(function () { t('', db.objects); }, TypeError, "Empty: undefined");
	a.throws(function () { t('0', db.objects); }, TypeError, "0: Null");
	a(t('11', db.objects), true, "Boolean");
	a(t('2"-342.234"', db.objects), -342.234, "Float");
	a(t('2342', db.objects), 342, "Integer");
	str = 'misiek\\nsdf\\\\raz\\ndwa\\\\trzy';
	a(t('3' + stringify(str), db.objects), str, "String: serialized");
	a(t('makumba', db.objects), 'makumba', "String: plain");
	a(typeof (x = t('6' + stringify(String(fn)), db.objects)), 'function',
		"Function: type");
	a(String(x).indexOf('return \'foo\';') > -1, true, "Function: content");
	a(isDate(x = t('412345', db.objects)), true, "Date: type");
	a(x.getTime(), 12345, "Date: value");
	a(t('5"/foo$/g"', db.objects).test('foo'), true, "RegExp");
	a(t('7DateTime', db.objects), db.DateTime, "Namespace");
	a.throws(function () { t('923', db.objects); }, TypeError, "Invalid value");
};
