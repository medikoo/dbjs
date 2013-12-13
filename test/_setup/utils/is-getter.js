'use strict';

module.exports = function (t, a) {
	a(t(), false, "Undefined");
	a(t(null), false, "Null");
	a(t('raz'), false, "String");
	a(t({}), false, "Object");
	a(t(function () {}), 1, "No args");
	a(t(function (raz) {}), 0, "One arg");
	a(t(function (raz, two) {}), 0, "Two args");
	a(t(function (_observe) {}), 2, "Special `_observe` arg");
	a(t(function (/*optional*/) {}), 0, "Optional argument");
};
