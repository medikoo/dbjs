'use strict';

var Database = require('../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), desc, item;

	a.throws(function () { t(); }, TypeError, "Undefined");
	a.throws(function () { t(null); }, TypeError, "Null");
	a.throws(function () { t('raz'); }, TypeError, "String");
	a.throws(function () { t(2342); }, TypeError, "Number");
	a.throws(function () { t(new Date()); }, TypeError, "Date");
	a.throws(function () { t(new db.DateTime()); }, TypeError,
		"Date out of database");
	a.throws(function () { t({}); }, TypeError, "Plain object");
	a(t(obj), obj, "Db object");
	desc = obj.$getOwn('test');
	a(t(desc), desc, "Db descriptor");
	desc = desc.$getOwn('raz');
	a(t(desc), desc, "Db descriptor's descriptor");
	item = obj._getMultiple_('test').$getOwn('raz');
	a(t(item), item, "Db item");
};
