'use strict';

var base    = require('../../lib/types/base')
  , boolean = require('../../lib/types/boolean')
  , number  = require('../../lib/types/number');

module.exports = function (a) {
	var ns = base.abstract('reltransporttest', {
		foo: boolean.rel({ value: true, required: true })
	});

	a(ns.foo, true, "Value");
	a(ns._foo.ns, boolean, "Namespace");
	a(ns._foo.required, true, "Property");

	ns = base.abstract('reltransporttest2', {
		foo: boolean.rel(true)
	});

	a(ns.foo, true, "Direct Value: Value");
	a(ns._foo.ns, boolean, "Direct Value: Namespace");

	ns = base.abstract('reltransporttest3', {
		foo: number.rel([1, 0, '23', 134])
	});

	a.deep(ns.foo.values, [1, 0, 23, 134], "Multiple Value: Value");

	a.throws(function () {
		ns = base.abstract('reltransporttest4', {
			foo: number.rel([1, 0, '23', {}])
		});
	}, "Invalid value in set");
};
