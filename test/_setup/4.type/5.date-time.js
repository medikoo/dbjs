'use strict';

var isDate         = require('es5-ext/date/is-date')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , Database       = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type = db.DateTime
	  , TypeCustom = Type.extend('Datetest',
			{ min: { value: new Date(2000, 0, 1)  },
				max: { value: new Date(2077, 0, 3) },
				step: { value: 1000 * 60 * 60 * 24 } });

	a(isDate(Type()), true, "No arguments");
	a(Type.is(Type()), true, "DateTume type: No arguments");
	a.throws(function () { Type(undefined); }, 'INVALID_DATETIME', "Undefined");
	a(Type(null).getTime(), 0, "Null");
	a(Type(false).getTime(), 0, "Boolean");
	a.throws(function () { Type({}); }, 'INVALID_DATETIME', "Object");
	a.throws(function () { Type('false'); }, 'INVALID_DATETIME',
		"Unconversible string");
	a(Type(123).getTime(), 123, "Number");
	a(Type(new Number(123)).getTime(), 123, "Number object"); //jslint: skip
	a(TypeCustom(Date.UTC(2030, 0, 1)).getTime(),
		(new Date(Date.UTC(2030, 0, 1))).getTime(), "Custom");
	a(TypeCustom(Date.UTC(2030, 0, 1, 4)).getTime(),
		(new Date(Date.UTC(2030, 0, 1))).getTime(), "Custom: Step");
	a.throws(function () { TypeCustom(1980, 0, 2); }, 'PAST_DATE',
		"Custom: Past");
	a.throws(function () { TypeCustom(2100, 1, 1); }, 'FUTURE_DATE',
		"Custom: Future");
	return {
		"Is": function (a) {
			a(Type.is(undefined), false, "Undefined");
			a(Type.is(null), false, "Null");
			a(Type.is(false), false, "Boolean");
			a(Type.is({}), false, "Object");
			a(Type.is('false'), false, "string");
			a(Type.is(2343), false, "Number");
			a(Type.is(new Date(123)), false, "Native date");
			a(TypeCustom.is(new Date(2013, 1, 1)), false, "Custom");
		},
		"Normalize": function (a) {
			var date;
			a(Type.normalize(undefined), null, "Undefined");
			a(Type.normalize(null).getTime(), 0, "Null");
			a(Type.normalize(false).getTime(), 0, "Boolean");
			a(Type.normalize({}), null, "Object");
			a(Type.normalize('false'), null, "Unconrversible string");
			a(Type.normalize(123).getTime(), 123, "Number");
			date = new Date();
			a(Type.normalize(date), date, "Date: Object");
			a(isDate(TypeCustom.normalize(date)), true, "Custom");
			date = new Date(Date.UTC(2033, 2, 3, 4));
			a(TypeCustom.normalize(date).getTime(),
				(new Date(Date.UTC(2033, 2, 3, 4))).getTime() - 1000 * 60 * 60 * 4,
				"Custom: Step");
			a(TypeCustom.normalize(new Date(1980, 0, 2)), null, "Custom: Past");
			a(TypeCustom.normalize(new Date(2100, 1, 1)), null, "Custom: Future");
		},
		"Validate": function (a) {
			a.throws(function () { Type.validate(undefined); }, 'INVALID_DATETIME',
				"Undefined");
			a(Type.validate(null).getTime(), 0, "Null");
			a(Type.validate(false).getTime(), 0, "Boolean");
			a.throws(function () { Type.validate({}); }, 'INVALID_DATETIME',
				"Object");
			a.throws(function () { Type.validate('false'); }, 'INVALID_DATETIME',
				"Unconversible string");
			a(Type.validate(123).getTime(), 123, "Number");
			a(Type.validate(new Number(123)).getTime(), 123, //jslint: skip
				"Number object");
			a(TypeCustom.validate(Date.UTC(2030, 0, 1)).getTime(),
				(new Date(Date.UTC(2030, 0, 1))).getTime(), "Custom");
			a(TypeCustom.validate(Date.UTC(2030, 0, 1, 4)).getTime(),
				(new Date(Date.UTC(2030, 0, 1))).getTime(), "Custom: Step");
			a.throws(function () { TypeCustom.validate(new Date(1980, 0, 2)); },
				'PAST_DATE', "Custom: Past");
			a.throws(function () { TypeCustom.validate(new Date(2100, 1, 1)); },
				'FUTURE_DATE', "Custom: Future");
		},
		"toString": function (a) {
			var date = new Date();
			setPrototypeOf(date, Type.prototype);
			a(String(date), date.toLocaleString(db.locale));
		}
	};
};
