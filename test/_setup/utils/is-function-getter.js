'use strict';

module.exports = function (t, a) {
	a(t(function () {}), 1, "No args");
	a(t(function (raz) {}), 0, "One arg");
	a(t(function (raz, two) {}), 0, "Two args");
	a(t(function (_observe) {}), 2, "Special `_observe` arg");
	a(t(function (_observe
/**/) {}), 2, "V8 Function constructor generated, with getter");
	a(t(function anonymous(
/**/) {}), 1, "V8 Function constructor generated"); //jslint: ignore
	a(t(function (/*optional*/) {}), 0, "Optional argument");
};
