'use strict';

var db = require('../lib/dbjs');

module.exports = function (t, a) {
	var prop = new t(db.string, 12);
	a(prop.value, '12', "Value");
	a(prop.ns, db.string, "Namespace");
	a((prop.updated / 1000) <= (Date.now() + 1), true, "Updated");
};
