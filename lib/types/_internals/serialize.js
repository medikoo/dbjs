'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')

  , stringify = JSON.stringify

module.exports = function (value) {
	var type;
	if (value === undefined) return '';
	if (value === null) return '-';

	type = typeof value;
	if (value.__id) return 'o' + value.__id;
	if (type === 'boolean') return 'b' + Number(value);
	if (type === 'number') return 'n' + String(value);
	if (type === 'string') return 's' + stringify(value).slice(1, -1);
	if (type === 'function') return 'f' + stringify(String(value)).slice(1, -1);
	if (isDate(value)) return 'd' + Number(value);
	if (isRegExp(value)) return 'r' + stringify(String(value)).slice(1, -1);
	throw new TypeError(value + " is not compatible with dbjs");
};
