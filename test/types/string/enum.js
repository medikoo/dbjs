'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	var week = t.create('enumweektest', {
		options: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
	});

	a(week('MO'), 'MO', "Valid");
	a.throws(function () { week('FOO'); }, "Invalid");

	return {
		"Is": function (a) {
			a(week.is({ toString: function () { return 'MO'; } }), false,
				"Not string");
			a(week.is('TU'), true, "Option");
			a(week.is('FOO'), false, "Other string");
		},
		"Normalize": function () {
			a(week.normalize('MO'), 'MO', "Valid");
			a(week.normalize('FOO'), null, "Invalid");
			a(week.normalize({ toString: function () { return 'MO'; } }), 'MO',
				"Coercible");
			a(week.normalize({}), null, "Invalid #2");
		},
		"Validate": function () {
			a(week.validate('MO'), undefined, "Valid");
			a(isError(week.validate('FOO')), true, "Invalid");
			a(week.validate({ toString: function () { return 'MO'; } }), undefined,
				"Coercible");
			a(isError(week.validate({})), true, "Invalid #2");
		}
	};
};
