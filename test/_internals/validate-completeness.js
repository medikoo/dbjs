'use strict';

var root = require('../../lib/_internals/namespace');

module.exports = function (t, a) {
	var ns = root.abstract('vctest', {
		normalize: function () {}
	});

	a.throws(function () {
		t(ns);
	}, "Invalid");

	a(t(ns, { validate: true }), undefined, "Ignored");

	ns.validate = function () {};

	a(t(ns), undefined, "Valid");
};
