'use strict';

var base = require('../../../lib/types/base');

module.exports = function (a) {
	var ns = base.abstract('reltransporttest', {
		foo: base.boolean.rel({ value: true, required: true })
	});

	a(ns.foo, true, "Value");
	a(ns._foo.ns, base.boolean, "Namespace");
	a(ns._foo.required, true, "Property");
};
