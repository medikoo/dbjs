'use strict';

var isError   = require('es5-ext/lib/Error/is-error')
  , serialize = require('../../lib/utils/serialize');

module.exports = function (t, a) {
	var ns = t.create('Strtest', { pattern: /^\d+$/, min: 3, max: 7 });

	a(t(undefined), 'undefined', "Undefined");
	a(t(null), 'null', "Null");
	a(t(false), 'false', "Boolean");
	a(t({}), {}.toString(), "Object");
	a(t('foobar'), 'foobar', "String");
	a(t(new String('foobar')), 'foobar', "String object"); //jslint: skip
	a(t(123), '123', "Number");

	a(ns('23432'), '23432', "Custom");
	a.throws(function () { ns('sdfs'); }, "Custom: Pattern");
	a.throws(function () { ns('12'); }, "Custom: Length min");
	a.throws(function () { ns('1231231231232131'); }, "Custom: Length max");

	return {
		"Is": function (a) {
			a(t.is(undefined), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(false), false, "Boolean");
			a(t.is({}), false, "Object");
			a(t.is('foobar'), true, "String");
			a(t.is(new String('foobar')), false, "String object"); //jslint: skip
			a(t.is(123), false, "Number");

			a(ns.is('23432'), true, "Custom: Is");
			a(ns.is('sdfs'), false, "Custom: Is: Pattern");
			a(ns.is('12'), false, "Custom: Is: Length min");
			a(ns.is('1231231231232131'), false,
				"Custom: Is: Length max");
		},
		"Normalize": function (a) {
			a(t.normalize(undefined), 'undefined', "Undefined");
			a(t.normalize(null), 'null', "Null");
			a(t.normalize(false), 'false', "Boolean");
			a(t.normalize({}), {}.toString(), "Object");
			a(t.normalize('foobar'), 'foobar', "String");
			a(t.normalize(new String('foobar')), 'foobar', //jslint: skip
				"String object");
			a(t.normalize(123), '123', "Number");

			a(ns.normalize('23432'), '23432', "Custom: Normalize");
			a(ns.normalize('sdfs'), null, "Custom: Normalize: Pattern");
			a(ns.normalize('12'), null, "Custom: Normalize: Length min");
			a(ns.normalize('1231231231232131'), null,
				"Custom: Normalize: Length max");
		},
		"Validate": function (a) {
			a(t.prototype.validateCreate(), null, "Undefined");
			a(t.prototype.validateCreate(null), null, "Null");
			a(t.prototype.validateCreate(false), null, "Boolean");
			a(t.prototype.validateCreate({}), null, "Object");
			a(t.prototype.validateCreate('foobar'), null, "String");
			a(t.prototype.validateCreate(new String('foobar')), null, //jslint: skip
				"String object");
			a(t.prototype.validateCreate(123), null, "Number");

			a(ns.prototype.validateCreate('23432'), null, "Custom: Validate");
			a(isError(ns.prototype.validateCreate('sdfs')), true,
				"Custom: Validate: Pattern");
			a(isError(ns.prototype.validateCreate('12')), true,
				"Custom: Validate: Length min");
			a(isError(ns.prototype.validateCreate('1231231231232131')), true,
				"Custom: Validate: Length max");
		},
		"Serialize": function (a) {
			a(t._serialize_('foobar'), serialize('foobar'));
		}
	};
};
