'use strict';

var Database = require('../')
	, DbjsError = require('../_setup/error');

module.exports = function (t, a) {
	var dbjsError = new DbjsError, error = new Error("someError");

	a(t(), false, "Undefined");
	a(t(null), false, "Null");
	a(t('raz'), false, "String");
	a(t(2342), false, "Number");
	a(t(dbjsError), true, "Constructor");
	a(t(new DbjsError("errorName")), true, "Constructor with name");
	a(t(dbjsError.name = undefined), false, "Name undefined");
	a(t(dbjsError.name = null), false, "Name null");
	a(t(dbjsError.name = false), false, "Name false");
	a(t(dbjsError.name = ""), false, "Name empty string");
	a(t(dbjsError.name = NaN), false, "Name NaN");
	a(t(dbjsError.name = "someName"), false, "Constructed with Dbjs, but with incorrect name");
	a(t(error), false, "Error with string in constructor");
	error.name = "errorName";
	a(t(error), false, "Error with incorrect name property");
	error.name = "DbjsError";
	a(t(error), true, "Error with correct name property"); //duck typing
};
