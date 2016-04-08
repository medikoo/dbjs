'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db         = new Database()
	  , Type       = db.Number
	  , FloatType  = Type.extend('TestFloatType', { step: { value: 0.001 } })
	  , CustomType = Type.extend('Numtest2', { min: { value: -100 },
			max: { value: 100 }, step: { value: 10 } });

	return {
		Constructor: function (a) {
			// Valid values
			a(Type(null), 0, "Null");
			a(Type(false), 0, "Boolean");
			a(Type('0'), 0, "Conversible string");
			a(Type(123), 123, "Number");
			a(Type(new Number(123)), 123, "Number object"); //jslint: ignore
			a(Type(123.1), 123.1, "Number");
			// Invalid values
			a.throws(function () { Type(undefined); }, 'INVALID_NUMBER', "Undefined");
			a.throws(function () { Type({}); }, 'INVALID_NUMBER', "Object");
			a.throws(function () { Type('false'); }, 'INVALID_NUMBER', "Unconversible string");
		},
		step: function (a) {
			a(FloatType(9772.13), 9772.13, "Fractional step: Fall within");
			a(FloatType(0.6666666666666666), 0.666, "Fractional step: Overflow");
			a(CustomType(60), 60, "Integral step: Fall within");
			a(CustomType(64), 60, "Integral step: Custom: Overflow");
		},
		minMax: function (a) {
			a.throws(function () { CustomType(-123); }, 'NUMBER_TOO_SMALL',
				"Custom: Below min");
			a.throws(function () { CustomType(123); }, 'NUMBER_TOO_LARGE',
				"Custom: Above max");
		},
		Is: function (a) {
			a(Type.is(undefined), false, "Undefined");
			a(Type.is(null), false, "Null");
			a(Type.is(false), false, "Boolean");
			a(Type.is({}), false, "Object");
			a(Type.is('false'), false, "Unconrvertable string");
			a(Type.is('0'), false, "Convertable string");
			a(Type.is(123), true, "Number");
			a(Type.is(new Number(123)), false, "Number object"); //jslint: ignore
			a(CustomType.is(60), true, "Custom");
			a(CustomType.is(64), false, "Custom: Step");
			a(CustomType.is(-123), false, "Custom: Below min");
			a(CustomType.is(123), false, "Custom: Above max");
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
			a(CustomType.normalize(60), 60, "Custom");
			a(CustomType.normalize(64), 60, "Custom: Step");
			a(CustomType.normalize(-123), null, "Custom: Below min");
			a(CustomType.normalize(123), null, "Custom: Above max");
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
			a(CustomType.validate(60), 60, "Custom");
			a(CustomType.validate(64), 60, "Custom: Step");
			a.throws(function () { CustomType.validate(-123); }, 'NUMBER_TOO_SMALL',
				"Custom: Below min");
			a.throws(function () { CustomType.validate(123); }, 'NUMBER_TOO_LARGE',
				"Custom: Above max");
		},
		toString: function (a) {
			var aThousand      = new Type(1000)
			  , withOneTenth   = new Type(1000.1)
			  , aFloatThousand = new FloatType(1000.1);

			a.h1("Without locale set");
			a(aThousand.toString(), '1,000', "Default");
			a(withOneTenth.toString(), '1,000.1', "Default: Float");
			a(aFloatThousand.toString(), '1,000.100', "With step");

			a.h1("With locale set");
			db.locale = 'pl';
			// Important: Those three next spaces between digits are no-brake spaces (Unicode: U+00A0)
			a(aThousand.toString(), '1 000', "Default");
			a(withOneTenth.toString(), '1 000,1', "Default: Float");
			a(aFloatThousand.toString(), '1 000,100', "With step");

			a.h1("Descriptor parameter");
			db.locale = 'en';
			a(aThousand.toString({ step: 0.1 }), '1,000.0', "Step");

			a.h1("Formatting options");
			a(aThousand.toString({ step: 0.1 }, { style: 'percent' }),
				'100,000.0%', "Style");
			a(aThousand.toString({ step: 0.1 }, { style: 'percent', useGrouping: false }),
				'100000.0%', "Grouping");
		}
	};
};
