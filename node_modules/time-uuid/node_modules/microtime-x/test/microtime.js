'use strict';

var now = Date.now, round = Math.round;

module.exports = function (t, a) {
	a(round(t() / 100000), round(now() / 100));
};
