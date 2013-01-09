'use strict';

var isDate = require('es5-ext/lib/Date/is-date')
  , isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	var getter = function () {}, fn = function (value) {};
	a.throws(function () { t(); }, "Undefined");
	a.throws(function () { t(getter); }, "Getter");
	a(t(fn), fn, "Function")
	a.throws(function () { t(/raz/); }, "No function");
	a.throws(function () { t({}); }, "Other object");
	return {
		"Is": function (a) {
			var getter = function () {}, fn = function (value) {};
			a(t.is(), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(getter), false, "Getter");
			t.normalize(getter);
			a(t.is(getter), false, "Getter: Normalized");
			a(t.is(fn), false, "Function");
			t.normalize(fn);
			a(t.is(fn), true, "Function: Normalized");
			a(t.is({}), false, "Other object");
		},
		"Normalize": function (a) {
			var getter = function () {}, fn = function (value) {};
			a(t.normalize(), null, "Undefined");
			a(t.normalize(null), null, "Null");
			a(t.normalize(getter), null, "Function");
			a(t.normalize(fn), fn, "Function");
			a(t.normalize({}), null, "Other object");
		},
		"Validate": function (a) {
			var getter = function () {}, fn = function (value) {};
			a(isError(t.prototype.validateCreate()), true, "Undefined");
			a(isError(t.prototype.validateCreate(null)), true, "Null");
			a(isError(t.prototype.validateCreate(getter)), true, "Getter");
			a(t.prototype.validateCreate(fn), null, "Function");
			a(isError(t.prototype.validateCreate({})), true, "Other object");
		}
	};
};
