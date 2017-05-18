'use strict';

var Database = require('../../');

module.exports = function (t, a) {
	var db = new Database();
	db.String.extend('ShortString', { max: { value: 3 } });

	a(t(function () { return "foo"; }), "foo");

	a.deep(t(
		function (result) { result.foo = 'bar'; },
		function (result) { result.miszka = 'tom'; },
		function (result) { result.marko = 'elo'; }
	), { foo: 'bar', miszka: 'tom', marko: 'elo' });

	try {
		t(
			function (result) { result.foo = 'bar'; },
			function (result) { db.ShortString.validate('marko'); },
			function (result) { db.ShortString.validate('SDFSF'); }
		);
		a.never();
	} catch (err) {
		a(err.name, 'DbjsError');
		a(err.code, 'SET_PROPERTIES_ERROR');
		a(err.errors.length, 2);

		try {		
			t(err, function () { });
		} catch (err2) {
			if (!err2.errors) throw err2;
			a.deep(err2.errors, [err]);
		}
	}
};
