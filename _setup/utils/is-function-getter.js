'use strict';

var d = require('d')

  , defineProperty = Object.defineProperty, re;

re = /^\s*function\s*(?:[\0-'\)-\uffff]+)*\s*\(\s*(_observe)?[\/*\s]*\)\s*\{/;

module.exports = function (value) {
	var match, status;
	if (value.length > 1) return 0;
	if (value.hasOwnProperty('$dbjs$getter')) return value.$dbjs$getter;
	match = String(value).match(re);
	if (!match) status = 0;
	else if (match[1]) status = 2;
	else status = 1;
	defineProperty(value, '$dbjs$getter', d('', status));
	return status;
};
