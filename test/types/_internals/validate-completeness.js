'use strict';

var base = require('../../../lib/types/base');

module.exports = function (t, a) {
	var ns = base.abstract('vctest', {
		normalize: function () {}
	});

	a.throws(function () {
		t(ns);
	}, "Invalid");

	a(t(ns, { validate: true }), undefined, "Ignored");

	ns.validate = function () {};

	a(t(ns), undefined, "Valid");
};
