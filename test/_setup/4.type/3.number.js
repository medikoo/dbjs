'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type = db.Number
	  , TypeCustom = Type.extend('Numtest2', { min: { value: -100 },
			max: { value: 100 }, step: { value: 10 } })
	  , FloatType = Type.extend('FloatTest', { step: { value: 0.001 } });

	a.throws(function () { Type(undefined); }, 'INVALID_NUMBER', "Undefined");
	a(Type(null), 0, "Null");
	a(Type(false), 0, "Boolean");
	a.throws(function () { Type({}); }, 'INVALID_NUMBER', "Object");
	a.throws(function () { Type('false'); }, 'INVALID_NUMBER',
		"Unconversible string");
	a(Type('0'), 0, "Conversible string");
	a(Type(123), 123, "Number");
	a(Type(new Number(123)), 123, "Number object"); //jslint: ignore
	a(TypeCustom(60), 60, "Custom");
	a(TypeCustom(64), 60, "Custom: step");
	a.throws(function () { TypeCustom(-123); }, 'NUMBER_TOO_SMALL',
		"Custom: Below min");
	a.throws(function () { TypeCustom(123); }, 'NUMBER_TOO_LARGE',
		"Custom: Above max");
	a(FloatType(9772.13), 9772.13, "Float step");
	a(FloatType(0.6666666666666666), 0.666, "Float step");
	db.locale = 'en';
	a(new Number(1000).toLocaleString(db.locale), new Type(1000).toString(), "toString"); //jslint: ignore
	a(new Number(1000.005).toLocaleString(db.locale), new FloatType(1000.005).toString(), "toString with step"); //jslint: ignore
	return {
		Is: function (a) {
			a(Type.is(undefined), false, "Undefined");
			a(Type.is(null), false, "Null");
			a(Type.is(false), false, "Boolean");
			a(Type.is({}), false, "Object");
			a(Type.is('false'), false, "Unconrvertable string");
			a(Type.is('0'), false, "Convertable string");
			a(Type.is(123), true, "Number");
			a(Type.is(new Number(123)), false, "Number object"); //jslint: ignore
			a(TypeCustom.is(60), true, "Custom");
			a(TypeCustom.is(64), false, "Custom: Step");
			a(TypeCustom.is(-123), false, "Custom: Below min");
			a(TypeCustom.is(123), false, "Custom: Above max");
		},
		Normalize: function (a) {
			a(Type.normalize(undefined), null, "Undefined");
			a(Type.normalize(null), 0, "Null");
			a(Type.normalize(false), 0, "Boolean");
			a(Type.normalize({}), null, "Object");
			a(Type.normalize('false'), null, "Unconrvertable string");
			a(Type.normalize('0'), 0, "Convertable string");
			a(Type.normalize(123), 123, "Number");
			a(Type.normalize(new Number(123)), 123, "Number object"); //jslint: ignore
			a(TypeCustom.normalize(60), 60, "Custom");
			a(TypeCustom.normalize(64), 60, "Custom: Step");
			a(TypeCustom.normalize(-123), null, "Custom: Below min");
			a(TypeCustom.normalize(123), null, "Custom: Above max");
		},
		Validate: function (a) {
			a.throws(function () { Type.validate(undefined); },
				'INVALID_NUMBER', "Undefined");
			a(Type.validate(null), 0, "Null");
			a(Type.validate(false), 0, "Boolean");
			a.throws(function () { Type.validate({}); }, 'INVALID_NUMBER', "Object");
			a.throws(function () { Type.validate('false'); }, 'INVALID_NUMBER',
				"Unconversible string");
			a(Type.validate('0'), 0, "Conversible string");
			a(Type.validate(123), 123, "Number");
			a(Type.validate(new Number(123)), 123, "Number object"); //jslint: ignore
			a(TypeCustom.validate(60), 60, "Custom");
			a(TypeCustom.validate(64), 60, "Custom: Step");
			a.throws(function () { TypeCustom.validate(-123); }, 'NUMBER_TOO_SMALL',
				"Custom: Below min");
			a.throws(function () { TypeCustom.validate(123); }, 'NUMBER_TOO_LARGE',
				"Custom: Above max");
		}
	};
};
