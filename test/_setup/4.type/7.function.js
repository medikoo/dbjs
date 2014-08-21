'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type = db.Function
	  , getter = function () {}, fn = function (value) {};

	a.throws(function () { Type(); }, 'INVALID_FUNCTION', "Undefined");
	a.throws(function () { Type(getter); }, 'FUNCTION_GETTER', "Getter");
	a(Type(fn), fn, "Function");
	a.throws(function () { Type(/raz/); }, 'INVALID_FUNCTION', "No function");
	a.throws(function () { Type({}); }, 'INVALID_FUNCTION', "Other object");
	return {
		Is: function (a) {
			var getter = function () {}, fn = function (value) {};
			a(Type.is(), false, "Undefined");
			a(Type.is(null), false, "Null");
			a(Type.is(getter), false, "Getter");
			Type.normalize(getter);
			a(Type.is(getter), false, "Getter: Normalized");
			a(Type.is(fn), false, "Function");
			Type.normalize(fn);
			a(Type.is(fn), true, "Function: Normalized");
			a(Type.is({}), false, "Other object");
		},
		Normalize: function (a) {
			var getter = function () {}, fn = function (value) {};
			a(Type.normalize(), null, "Undefined");
			a(Type.normalize(null), null, "Null");
			a(Type.normalize(getter), null, "Function");
			a(Type.normalize(fn), fn, "Function");
			a(Type.normalize({}), null, "Other object");
		},
		Validate: function (a) {
			var getter = function () {}, fn = function (value) {};
			a.throws(function () { Type.validate(); }, 'INVALID_FUNCTION',
				"Undefined");
			a.throws(function () { Type.validate(getter); }, 'FUNCTION_GETTER',
				"Getter");
			a(Type.validate(fn), fn, "Function");
			a.throws(function () { Type.validate(/raz/); }, 'INVALID_FUNCTION',
				"No function");
			a.throws(function () { Type.validate({}); }, 'INVALID_FUNCTION',
				"Other object");
		}
	};
};
