'use strict';

var db = require('../lib/dbjs');

module.exports = function (t) {
	return {
		"": function (a) {
			var obj;
			a(t(undefined), null, "Undefined");
			a(t(null), null, "Null");
			a(t(db.string), db.string, "Namespace");
			a.throws(function () {
				t(false);
			}, "Boolean");
			a.throws(function () {
				t({});
			}, "Unknown object");
			a.throws(function () {
				t('/sdfsdf/');
			}, "String");
			a.throws(function () {
				t(function () {});
			}, "Function");
			obj = db({});
			a.throws(function () {
				t(obj);
			}, "Namespaced object");
		},
		"Normalize": function (a) {
			a(t.normalize(undefined), undefined, "Undefined");
			a(t.normalize(null), null, "Null");
			a(t.normalize(db.string), db.string, "Namespace");
			a(t.normalize(false), null, "Boolean");
			a(t.normalize('raz'), null, "String");
			a(t.normalize({}), null, "Unknown object");
			a(t.normalize(db({})), null, "Namespaced object");
		},
		"Validate": function (a) {
			var obj;
			a(t.validate(undefined), null, "Undefined");
			a(t.validate(null), null, "Null");
			a(t.validate(db.string), db.string, "Namespace");
			a.throws(function () {
				t.validate(false);
			}, "Boolean");
			a.throws(function () {
				t.validate({});
			}, "Unknown object");
			a.throws(function () {
				t.validate('/sdfsdf/');
			}, "String");
			a.throws(function () {
				t.validate(function () {});
			}, "Function");
			obj = db({});
			a.throws(function () {
				t.validate(obj);
			}, "Namespaced object");
		}
	};
};
