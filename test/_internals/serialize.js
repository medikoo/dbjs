'use strict';

var ObjectType = require('../../lib/types/object')
  , FunctionType = require('../../lib/types/function');

module.exports = function (t, a) {
	var fn, x;
	a(t(undefined), '', "Undefined");
	a(t(null), '-', "Null");
	a(t(false), 'b0', "Boolean");
	a(t(-342.234), 'n-342.234', "Number");
	a(t('misiek\nsdf\\raz\ndwa\\trzy'), 'smisiek\\nsdf\\\\raz\\ndwa\\\\trzy',
		"String");
	a(t(fn = function () { return 'foo'; }), 'f' + String(fn), "Function");
	a(t(new Date(12345)), 'd12345', "Date");
	a(t(new RegExp('raz\ndwa')), 'r/raz\\ndwa/', "RegExp");
	a(t(FunctionType), 'oFunction', "Namespace");
	a(t(x = new ObjectType({ foo: 'bar' })), 'o' + x.__id, "Object");
	a.throws(function () { t({}); }, "Unrecognized");
};
