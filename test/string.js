'use strict';

module.exports = function (t) {
	return {
		"": function (a) {
			a(t(undefined), 'undefined', "Undefined");
			a(t(null), 'null', "Null");
			a(t(false), 'false', "Boolean");
			a(t({}), {}.toString(), "Object");
			a(t('foobar'), 'foobar', "String");
			a(t(new String('foobar')), 'foobar', "String object");
			a(t(123), '123', "Number");
		},
		"Normalize": function (a) {
			a(t.normalize(undefined), 'undefined', "Undefined");
			a(t.normalize(null), 'null', "Null");
			a(t.normalize(false), 'false', "Boolean");
			a(t.normalize({}), {}.toString(), "Object");
			a(t.normalize('foobar'), 'foobar', "String");
			a(t.normalize(new String('foobar')), 'foobar', "String object");
			a(t.normalize(123), '123', "Number");
		},
		"Validate": function (a) {
			a(t.validate(undefined), 'undefined', "Undefined");
			a(t.validate(null), 'null', "Null");
			a(t.validate(false), 'false', "Boolean");
			a(t.validate({}), {}.toString(), "Object");
			a(t.validate('foobar'), 'foobar', "String");
			a(t.validate(new String('foobar')), 'foobar', "String object");
			a(t.validate(123), '123', "Number");
		}
	};
};
