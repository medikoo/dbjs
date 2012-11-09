'use strict';

var db = require('../lib/dbjs');

module.exports = function (t, a) {
	var prop, prop2, x = {}, y = {};
	prop = new t(x, null, db.string, 'foo');
	prop.required = true;
	a(prop.isProperty, true, "isProperty");
	a(prop.obj, x, "Object");
	a(prop.name, 'foo', "Name");
	a(t.isProperty(prop), true, "Static isProperty");
	a(prop.value, undefined, "Value");
	a(prop.ns, db.string, "Namespace");

	a.throws(function () {
		prop.validateUndefinedExt();
	}, "Validated required");

	prop2 = prop.create(y, 123);
	a(prop2.obj, y, "Extended: Object");
	a(prop2.name, 'foo', "Extended: Name");
	a(prop2.isProperty, true, "Extended: isProperty");
	a(t.isProperty(prop2), true, "Extended: Static isProperty");
	a(prop2.value, '123', "Extended: Normalized");

	a(prop2.validateUndefinedExt(), undefined, "Extended: Validate required");

	prop.set(false, null);
	a(prop.value, false, "Overriden: value");
	a(prop.ns, null, "Overriden: namespace");

	a(prop2.value, '123', "Overriden: Not changed extended value");
	prop2.set(345);
	a(prop2.value, 345, "Reset no namespace");

	prop.validate = function (value, ns) {
		a(this, prop2, "Validate: Context");
		a(ns, db.string, "Validate: Namespace");
		if (!/^\d{3}$/.test(value)) throw new TypeError("Wrong value");
		return value;
	};
	prop.set('bar', db.string);
	a(prop.value, 'bar', "Reset: Value");
	a(prop.ns, db.string, "Reset: Namespace");
	a.throws(function () { prop2.set('raz'); }, "Prop: validate");
	prop2.set(434);
	a(prop2.value, '434', "Reset: Extended: Normalized");
};
