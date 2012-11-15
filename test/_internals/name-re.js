'use strict';

module.exports = function (t, a) {
	a(t.test('0sdfs'), false, "Digit first");
	a(t.test('raz dwa'), false, "Inner space");
	a(t.test('_foo'), false, "Underscore");
	a(t.test('ra23zD42wa'), true, "Valid");
};
