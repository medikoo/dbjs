'use strict';

var isDate   = require('es5-ext/date/is-date')
  , isRegExp = require('es5-ext/reg-exp/is-reg-exp')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , stringify = JSON.stringify;

module.exports = function (value) {
	var type;
	if (value === undefined) return '';
	if (value === null) return '0';
	type = typeof value;
	if (type === 'boolean') return '1' + Number(value);
	if (type === 'number') return '2' + value;
	if (type === 'string') return '3' + stringify(value).slice(1, -1);
	if (hasOwnProperty.call(value, '__id__')) return '7' + value.__id__;
	if (type === 'function') return '6' + stringify(String(value)).slice(1, -1);
	if (isDate(value)) return '4' + Number(value);
	if (isRegExp(value)) return '5' + stringify(String(value)).slice(1, -1);
	return null;
};
