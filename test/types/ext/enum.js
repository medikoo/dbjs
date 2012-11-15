'use strict';

module.exports = function (t, a) {
	var week = t.create('enumweektest', {
		options: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
	});

	a(week('MO'), 'MO', "Valid");
	a.throws(function () { week('FOO'); }, "Invalid");

	return {
		"Normalize": function () {
			a(week.normalize('MO'), 'MO', "Valid");
			a(week.normalize('FOO'), null, "Invalid");
			a(week.normalize({}), null, "Invalid #2");
		},
		"Validate": function () {
			a(week.validate('MO'), 'MO', "Valid");
			a.throws(function () { week.validate('FOO'); }, "Invalid");
		}
	}
};
