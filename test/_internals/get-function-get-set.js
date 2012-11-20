'use strict';

module.exports = function (t, a) {
	var x = Object.defineProperty({}, 'bar', t('bar'))
	  , fn = function () {}
	  , fn2 = function () {};

	a(x.bar, undefined, "Not set");
	a.throws(function () {
		x.bar = /raz/;
	}, "Try to set not function");
	a(x.bar, undefined, "Not set, after failure");
	x.bar = fn;
	a(x.bar, fn, "Set");
	a.throws(function () {
		x.bar = /razdwa/;
	}, "Try to set not function on already set");
	a(x.bar, fn, "Not changed");

	x.bar = fn2;
	a(x.bar, fn2, "Set #2");
};
