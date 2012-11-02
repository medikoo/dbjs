'use strict';

var now = require('microtime-x');

module.exports = function (t, a) {
	var time;
	a(typeof t(now()), 'string', "Type");
	a(/^\d[a-z0-9]+$/.test(now()), true, "Format");
	time = now();
	a(t(time), t(time), "Same time returns same ID");
};
