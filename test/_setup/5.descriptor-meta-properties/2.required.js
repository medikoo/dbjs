'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$get('test');

	desc.required = 'sdf';
	a(desc.required, true, "Boolean type");

	a.throws(function () { obj.test = null; }, 'VALUE_REQUIRED', "Throw on null");
	obj.test = 'fafa';
};
