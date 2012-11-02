'use strict';

var now = require('microtime-x')

  , last = 0;

module.exports = function () {
	var time = now();
	while (time <= last) ++time;
	last = time;
	return time;
};
