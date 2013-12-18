'use strict';

var startsWith = require('es5-ext/string/#/starts-with')
  , Database   = require('../../../')

  , stringify = JSON.stringify;

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), fn, re
	  , dateTime = new db.DateTime(), key;

	a(t(undefined), null, "Undefined");
	a(t(null), null, "Null");
	a(t(false), '10', "Boolean");
	a(t(-342.234), '2"-342.234"', "Float");
	a(t(34), '234', "Integer");
	a(t(-34), '2-34', "Negative Integer");

	a.h1("String");
	key = 'foo:bar';
	a(t(key), key, "Colon");
	key = 'foo/bar';
	a(startsWith.call(t(key), '3"'), true, "/");
	key = 'foo\\bar';
	a(startsWith.call(t(key), '3"'), true, "\\");
	key = 'foo.bar';
	a(startsWith.call(t(key), '3"'), true, ".");
	key = 'foo*bar';
	a(startsWith.call(t(key), '3"'), true, "*");
	key = 'foo bar';
	a(t(key), key, "Space");
	key = 'foo\nbar';
	a(startsWith.call(t(key), '3"'), true, "New line");
	key = 'foo"bar';
	a(startsWith.call(t(key), '3"'), true, "Double quote");
	key = 'foo\'bar';
	a(t(key), key, true, "Single quote");
	key = '7foobar';
	a(startsWith.call(t(key), '3"'), true, "Digit as first char");

	a.h1();
	fn = function () { return 'foo'; };
	a(t(fn), '6' + stringify(String(fn)), "Function");
	a(t(new Date(12345)), '412345', "Date");
	a(t(dateTime), t(new Date(dateTime.getTime())), "DBJS DateTime");
	re = new RegExp('raz\ndwa');
	a(t(re), '5' + stringify(String(re)), "RegExp");
	a(t(db.DateTime), '7DateTime', "Namespace");
	a(t(obj), '7' + obj.__id__, "Object");
	a(t({}), null, "Unrecognized");
};
