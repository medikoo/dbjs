'use strict';

var isError  = require('es5-ext/lib/Error/is-error')
  , isRegExp = require('es5-ext/lib/RegExp/is-reg-exp');

module.exports = function (t, a) {
	var re = /raz/;
	a(isRegExp(t()), true, "Undefined");
	a(t(re), re, "RegExp");
	a(isRegExp(t('/sdfsdf/')), true, "String");
	a.throws(function () { t('\\'); }, "Bad string");
	return {
		"Is": function (a) {
			a(t.is(undefined), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(re), true, "RegExp");
			a(t.is(false), false, "Boolean");
			a(t.is('raz'), false, "String");
			a(t.is('\\'), false, "Invalid regExp string");
		},
		"Normalize": function (a) {
			a(isRegExp(t.normalize(undefined)), true, "Undefined");
			a(isRegExp(t.normalize(null)), true, "Null");
			a(t.normalize(re), re, "RegExp");
			a(isRegExp(t.normalize(false)), true, "Boolean");
			a(isRegExp(t.normalize('raz')), true, "String");
			a(t.normalize('\\'), null, "Invalid regExp string");
		},
		"Validate": function (a) {
			a(t.validate(), null, "Undefined");
			a(t.validate(null), null, "Null");
			a(t.validate(re), null, "RegExp");
			a(t.validate(false), null, "Boolean");
			a(t.validate('raz'), null, "String");
			a(isError(t.validate('\\')), true, "Invalid regExp string");
		}
	};
};
