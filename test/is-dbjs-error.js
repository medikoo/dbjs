'use strict';

var Database = require('../')
	, DbjsError = require('../_setup/error');

module.exports = function (t, a) {
	a(t(), false, "Undefined");
	a(t(null), false, "Null");
	a(t('raz'), false, "String");
	a(t(2342), false, "Number");
	a(t(new DbjsError), true, "Constructor");
	a(t(new Error("someError")), false, "Error");
};
