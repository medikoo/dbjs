'use strict';

var isDate     = require('es5-ext/lib/Date/is-date')
  , DateTime   = require('../../lib/types-base/date-time');

module.exports = function (t, a) {
	var fn = function () { return 'foo'; }, x;
	a(t(''), undefined, "Undefined");
	a(t('0'), null, "Null");
	a(t('11'), true, "Boolean");
	a(t('2-342.234'), -342.234, "Number");
	a(t('3misiek\\nsdf\\\\raz\\ndwa\\\\trzy'), 'misiek\nsdf\\raz\ndwa\\trzy',
		"String");
	a(typeof (x = t('6' + String(fn))), 'function', "Function: type");
	a(String(x).indexOf('return \'foo\';') > -1, true, "Function: content");
	a(isDate(x = t('412345')), true, "Date: type");
	a(x.getTime(), 12345, "Date: value");
	a(t('5/foo$/g').test('foo'), true, "RegExp");
	a(t('7DateTime'), DateTime, "Namespace");
};
