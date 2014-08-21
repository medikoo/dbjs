'use strict';

var isRegExp = require('es5-ext/reg-exp/is-reg-exp')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type = db.RegExp, re = /raz/, other;

	a(isRegExp(Type()), true, "Undefined");
	other = Type(re);
	a(isRegExp(other), true, "RegExp: isRegExp");
	a(String(other), String(re), "RegExp: value");
	a(isRegExp(Type('/sdfsdf/')), true, "String");
	a.throws(function () { Type('\\'); }, 'INVALID_REGEXP', "Bad string");

	return {
		Is: function (a) {
			var re = /raz/;
			a(Type.is(undefined), false, "Undefined");
			a(Type.is(null), false, "Null");
			a(Type.is(re), false, "RegExp");
			re = Type.normalize(re);
			a(Type.is(re), true, "RegExp: Normalize");
			a(Type.is(false), false, "Boolean");
			a(Type.is('raz'), false, "String");
			a(Type.is('\\'), false, "Invalid regExp string");
		},
		Normalize: function (a) {
			var re = /raz/;
			a(isRegExp(Type.normalize(undefined)), true, "Undefined");
			a(isRegExp(Type.normalize(null)), true, "Null");
			a(Type.normalize(re), re, "RegExp");
			a(isRegExp(Type.normalize(false)), true, "Boolean");
			a(isRegExp(Type.normalize('raz')), true, "String");
			a(Type.normalize('\\'), null, "Invalid regExp string");
		},
		Validate: function (a) {
			var re = /raz/;
			a(isRegExp(Type.validate(undefined)), true, "Undefined");
			a(isRegExp(Type.validate(null)), true, "Null");
			a(String(Type.validate(re)), String(re), "RegExp");
			a(isRegExp(Type.validate(false)), true, "Boolean");
			a(isRegExp(Type.validate('raz')), true, "String");
			a.throws(function () { Type.validate('\\'); }, 'INVALID_REGEXP',
				"Bad string");
		}
	};
};
