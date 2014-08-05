'use strict';

var Database = require('../')
	, DbjsError = require('../_setup/error');

module.exports = function (t, a) {
	var dbjsError = new DbjsError();
	a.throws(function () { t(); }, TypeError, "Undefined");
	a.throws(function () { t(null); }, TypeError, "Null");
	a.throws(function () { t('raz'); }, TypeError, "String");
	a.throws(function () { t(2342); }, TypeError, "Number");
	a.throws(function () { t(NaN); }, TypeError, "NaN");
	a.throws(function () { t(new Date()); }, TypeError, "Date");
	a.throws(function () { t({}); }, TypeError, "Plain object");
	a.throws(function () { t(new Error('err')); }, TypeError, "Error object");
	a(t(dbjsError), dbjsError, "DbjsError");
};
