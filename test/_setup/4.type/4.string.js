'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type = db.String
	  , TypeCustom = Type.extend('Strtest', { pattern: { value: /^\d+$/ },
			min: { value: 3 }, max: { value: 7 } });

	a(Type(undefined), 'undefined', "Undefined");
	a(Type(null), 'null', "Null");
	a(Type(false), 'false', "Boolean");
	a(Type({}), Object().toString(), "Object");
	a(Type('foobar'), 'foobar', "String");
	a(Type(new String('foobar')), 'foobar', "String object"); //jslint: ignore
	a(Type(123), '123', "Number");

	a(TypeCustom('23432'), '23432', "Custom");
	a.throws(function () { TypeCustom('sdfs'); }, 'INVALID_STRING',
		"Custom: Pattern");
	a.throws(function () { TypeCustom('12'); }, 'STRING_TOO_SHORT',
		"Custom: Length min");
	a.throws(function () { TypeCustom('1231231231232131'); }, 'STRING_TOO_LONG',
		"Custom: Length max");

	return {
		Is: function (a) {
			a(Type.is(undefined), false, "Undefined");
			a(Type.is(null), false, "Null");
			a(Type.is(false), false, "Boolean");
			a(Type.is({}), false, "Object");
			a(Type.is('foobar'), true, "String");
			a(Type.is(new String('foobar')), false, "String object"); //jslint: ignore
			a(Type.is(123), false, "Number");

			a(TypeCustom.is('23432'), true, "Custom: Is");
			a(TypeCustom.is('sdfs'), false, "Custom: Is: Pattern");
			a(TypeCustom.is('12'), false, "Custom: Is: Length min");
			a(TypeCustom.is('1231231231232131'), false,
				"Custom: Is: Length max");
		},
		Normalize: function (a) {
			a(Type.normalize(undefined), 'undefined', "Undefined");
			a(Type.normalize(null), 'null', "Null");
			a(Type.normalize(false), 'false', "Boolean");
			a(Type.normalize({}), Object().toString(), "Object");
			a(Type.normalize('foobar'), 'foobar', "String");
			a(Type.normalize(new String('foobar')), 'foobar', //jslint: ignore
				"String object");
			a(Type.normalize(123), '123', "Number");

			a(TypeCustom.normalize('23432'), '23432', "Custom: Normalize");
			a(TypeCustom.normalize('sdfs'), null, "Custom: Normalize: Pattern");
			a(TypeCustom.normalize('12'), null, "Custom: Normalize: Length min");
			a(TypeCustom.normalize('1231231231232131'), null,
				"Custom: Normalize: Length max");
		},
		Validate: function (a) {
			a(Type.validate(undefined), 'undefined', "Undefined");
			a(Type.validate(null), 'null', "Null");
			a(Type.validate(false), 'false', "Boolean");
			a(Type.validate({}), Object().toString(), "Object");
			a(Type.validate('foobar'), 'foobar', "String");
			a(Type.validate(new String('foobar')), 'foobar', //jslint: ignore
				"String object");
			a(Type.validate(123), '123', "Number");

			a(TypeCustom.validate('23432'), '23432', "Custom");
			a.throws(function () { TypeCustom.validate('sdfs'); }, 'INVALID_STRING',
				"Custom: Pattern");
			a.throws(function () { TypeCustom.validate('12'); }, 'STRING_TOO_SHORT',
				"Custom: Length min");
			a.throws(function () { TypeCustom.validate('1231231231232131'); },
				'STRING_TOO_LONG', "Custom: Length max");
		}
	};
};
