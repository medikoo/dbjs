'use strict';

var Database = require('../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object();

	a(t(), false, "Undefined");
	a(t(null), false, "Null");
	a(t('raz'), false, "String");
	a(t(2342), false, "Number");
	a(t(new Date()), false, "Date");
	a(t(new db.DateTime()), false, "Date out of database");
	a(t({}), false, "Plain object");
	a(t(obj), true, "Db object");
	a(t(obj.$get('test')), true, "Db descriptor");
	a(t(obj.$get('test').$get('raz')), true, "Db descriptor's descriptor");
	a(t(obj._getMultiple_('3test').$get('raz')), true, "Db item");
};
