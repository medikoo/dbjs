'use strict';

var Database  = require('../../../')
  , serialize = require('../../../_setup/serialize/value')

  , stringify = JSON.stringify;

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), key = 'foo'
	  , sKey = serialize(key);

	a(t(key, sKey), key, "Plain ident");

	key = 'foo:bar';
	sKey = serialize(key);
	a(t(key, sKey), key, "Colon");

	key = 'foo/bar';
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "/");

	key = 'foo\\bar';
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "\\");

	key = 'foo.bar';
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), ".");

	key = 'foo*bar';
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "*");

	key = 'foo bar';
	sKey = serialize(key);
	a(t(key, sKey), key, "Space");

	key = 'foo\nbar';
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "New line");

	key = 'foo"bar';
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "Double quote");

	key = 'foo\'bar';
	sKey = serialize(key);
	a(t(key, sKey), key, "Single quote");

	key = 34;
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "Number");

	key = true;
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "Boolean");

	key = /raz/;
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "RegExp");

	key = function () {};
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "Function");

	key = new Date();
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "Date");

	key = obj;
	sKey = serialize(key);
	a(t(key, sKey), stringify(sKey), "Object");
};
