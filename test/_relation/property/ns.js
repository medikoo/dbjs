'use strict';

var Db = require('../../../')

  , Base = Db.Base, StringType = Db.String;

module.exports = function (a) {
	var obj = Db({ nsTest: 'foo' });

	a(obj._nsTest.ns, Base, "Initial");
	a.throws(function () {
		obj._nsTest.ns = function () {};
	}, "Function");

	obj._nsTest.ns = StringType;
	a(obj._nsTest.ns, StringType, "Changed");
	obj._nsTest.ns = null;
	a(obj._nsTest.ns, Base, "Reset");
};
