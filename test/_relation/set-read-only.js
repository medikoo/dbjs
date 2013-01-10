'use strict';

var Db = require('../../')

  , NumberType = Db.Number, StringType = Db.String;

module.exports = function (t, a) {
	var testValue, set, ns = StringType.create('Relsetreadonlytest', {
		foo: StringType.rel({ multiple: true, value: function () {
			return testValue;
		} })
	});

	set = ns.foo;
	a.deep(set.values, [], "No value");
	a.throws(function () {
		set.add('foo');
	}, "Add");
	a.throws(function () {
		set.delete('foo');
	}, "Remove");

	a(set.has('foo'), false, "Has");

	testValue = 'marko';
	set = ns.foo;
	a.deep(set.values, ['marko'], "Single value");
	a(set.has('foo'), false, "Hasn't");
	a(set.has('marko'), true, "Has");

	testValue = [12, '32', 14, 'asdf'];
	set = ns.foo;
	a.deep(set.values, ['12', '32', '14', 'asdf'], "Multi value");
	a(set.has('foo'), false, "Hasn't");
	a(set.has(14), true, "Has");

	ns._foo.ns = NumberType;
	a.deep(set.values, ['12', '32', '14', 'asdf'],
		"Rel ns change doesn't affect value");
};