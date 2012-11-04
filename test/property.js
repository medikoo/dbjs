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

	a(prop.validate('asdfa'), undefined, "Validate");
	a.throws(function () {
		prop.validate();
	}, "Validated required");

	prop2 = prop.create(123);
	a(prop2.isProperty, true, "Extended: isProperty");
	a(t.isProperty(prop2), true, "Extended: Static isProperty");
	a(prop2.value, '123', "Extended: Normalized");
	a(prop2.validate('asdfa'), undefined, "Extended: Validate");
	a(prop2.validate(), undefined, "Extended: Validate required");

	prop.set(false);
	a(prop.value, false, "Overrien: value");
	a(prop.ns, null, "Overrien: namespace");

	a(prop2.value, '123', "Overriden: Not changed extended value");
	prop2.set(345);
	a(prop2.value, 345, "Reset no namespace");
};
