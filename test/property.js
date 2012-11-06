'use strict';

var db = require('../lib/dbjs');

module.exports = function (t, a) {
	var prop, prop2;
	prop = new t(db.string);
	prop.required = true;
	a(prop.isProperty, true, "isProperty");
	a(t.isProperty(prop), true, "Static isProperty");
	a(prop.value, db.string, "Value");
	a(prop.ns, db.string, "Namespace");

	a.throws(function () {
		prop.validateUndefinedExt();
	}, "Validated required");

	prop2 = prop.create(123);
	a(prop2.isProperty, true, "Extended: isProperty");
	a(t.isProperty(prop2), true, "Extended: Static isProperty");
	a(prop2.value, '123', "Extended: Normalized");


	a(prop2.validateUndefinedExt(), undefined, "Extended: Validate required");

	prop.set(false);
	a(prop.value, false, "Overriden: value");
	a(prop.ns, null, "Overriden: namespace");

	a(prop2.value, '123', "Overriden: Not changed extended value");
	prop2.set(345);
	a(prop2.value, 345, "Reset no namespace");

	prop.validate = function (value) {
		if (!/^\d{3}$/.test(value)) throw new TypeError("Wrong value");
	};
	prop.set(db.string);
	a.throws(function () { prop2.set('raz') }, "Prop: validate");
	prop2.set(434);
};
