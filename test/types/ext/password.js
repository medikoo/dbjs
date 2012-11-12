'use strict';

module.exports = function (t, a, d) {
	var pass, p1, p2;

	a.throws(function () {
		t('foo2');
	}, "Too short");

	a.throws(function () {
		t('sdfafdfaadfaf');
	}, "No digits");

	a.throws(function () {
		t('2342342342');
	}, "No alpha-numeric");

	pass = t('foobar17');
	p1 = t.compare('somethingelse', pass);
	p1.end(function (value) {
		a(value, false, "Not matching");
	});
	p2 = t.compare('foobar17', pass);
	p2.end(function (value) {
		a(value, true, "Matching");
	});
	p1(p2)(function () {}).end(d, d);
};
