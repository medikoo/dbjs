'use strict';

module.exports = function (t, a) {
	a(t(function () {}), false, "Getter");
	a(t(function (raz) {}), false, "Function");
	a(t(function (_observe) {}), true, "Getter with dynamic triggers");
	a(t(function (_observe, foo) {}), false, "Function 2");
};
