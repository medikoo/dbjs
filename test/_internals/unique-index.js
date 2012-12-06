'use strict';

var ObjectType = require('../../lib/types/object')
  , string     = require('../../lib/types/string');

module.exports = function (t, a) {
	var ns1 = ObjectType.create('Uniqtest1',
		{ foo: string.rel({ unique: true, value: 'zero' }) })

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

	a.throws(function () {
		obj12.foo = 'zero';
	}, "Proto span");
};
