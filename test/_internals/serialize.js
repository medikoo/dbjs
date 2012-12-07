'use strict';

var ObjectType = require('../../lib/types/object')
  , DateTime   = require('../../lib/types/date-time');

module.exports = function (t, a) {
	var fn, x;
	a(t(undefined), null, "Undefined");
	a(t(null), null, "Null");
	a(t(false), '10', "Boolean");
	a(t(-342.234), '2-342.234', "Number");
	a(t('misiek\nsdf\\raz\ndwa\\trzy'), '3misiek\\nsdf\\\\raz\\ndwa\\\\trzy',
		"String");
	a(t(fn = function () { return 'foo'; }), '6' + String(fn), "Function");
	a(t(new Date(12345)), '412345', "Date");
	a(t(new RegExp('raz\ndwa')), '5/raz\\ndwa/', "RegExp");
	a(t(DateTime), '7DateTime', "Namespace");
	a(t(x = new ObjectType({ foo: 'bar' })), '7' + x._id_, "Object");
	a(t([1,2,3]), '8"21","22","23"', "Array");
	a(t({}), null, "Unrecognized");
};
