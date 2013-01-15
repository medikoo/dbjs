'use strict';

var Db = require('../../')

  , StringType = Db.String;

module.exports = function (t, a) {
	var ns1 = Db.create('Uniqtest1',
		{ foo: StringType.rel({ unique: true, value: 'zero' }) })

	  , obj11, obj12, obj13;

	obj11 = ns1({ foo: 'raz' });
	obj12 = ns1({ foo: 'dwa' });

	a.throws(function () {
		obj13 = ns1({ foo: 'dwa' });
	}, "Try to create unique");

	a.throws(function () {
		obj11.foo = 'dwa';
	}, "Try to set unique");

	obj12.foo = 'trzy';
	obj13 = ns1({ foo: 'dwa' });
	obj11.foo = 'cztery';

	obj12.foo = 'zero'; // we're cool

	obj12.foo = undefined;

	a.throws(function () {
		obj13.foo = 'zero';
	}, "Unique via inherited");

	a(ns1.prototype._foo.find('cztery'), obj11, "Find");
};
