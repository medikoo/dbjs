'use strict';

var isError   = require('es5-ext/error/is-error')
  , isRegExp  = require('es5-ext/reg-exp/is-reg-exp')
  , serialize = require('../../lib/utils/serialize');

module.exports = function (t, a) {
	var re = /raz/;
	a(isRegExp(t()), true, "Undefined");
	a(t(re), re, "RegExp");
	a(isRegExp(t('/sdfsdf/')), true, "String");
	a.throws(function () { t('\\'); }, "Bad string");
	return {
		"Is": function (a) {
			var re = /raz/;
			a(t.is(undefined), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(re), false, "RegExp");
			t.normalize(re);
			a(t.is(re), true, "RegExp: Normalize");
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
			a(t.prototype.validateCreate(), null, "Undefined");
			a(t.prototype.validateCreate(null), null, "Null");
			a(t.prototype.validateCreate(re), null, "RegExp");
			a(t.prototype.validateCreate(false), null, "Boolean");
			a(t.prototype.validateCreate('raz'), null, "String");
			a(isError(t.prototype.validateCreate('\\')), true,
				"Invalid regExp string");
		},
		"Serialize": function (a) {
			var re = /raz/g;
			a(t._serialize_(re), serialize(re));
		}
	};
};
