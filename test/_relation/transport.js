'use strict';

var Db = require('../../')

  , Base = Db.Base, BooleanType = Db.Boolean, NumberType = Db.Number;

module.exports = function (a) {
	var ns = Base.create('RelTransportTest', {
		relTransportTest1: BooleanType.rel({ value: true, required: true })
	});

	a(ns.relTransportTest1, true, "Value");
	a(ns._relTransportTest1.ns, BooleanType, "Namespace");
	a(ns._relTransportTest1.required, true, "Property");

	ns = Base.create('Reltransporttest2', {
		relTransportTest1: BooleanType.rel(true)
	});

	a(ns.relTransportTest1, true, "Direct Value: Value");
	a(ns._relTransportTest1.ns, BooleanType, "Direct Value: Namespace");

	ns = Base.create('Reltransporttest3', {
		relTransportTest1: NumberType.rel([1, 0, '23', 134])
	});

	a.deep(ns.relTransportTest1.values, [1, 0, 23, 134], "Multiple Value: Value");

	a.throws(function () {
		ns = Base.create('Reltransporttest4', {
			relTransportTest1: NumberType.rel([1, 0, '23', {}])
		});
	}, "Invalid value in set");
};
