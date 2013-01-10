'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')

  , stringify = JSON.stringify;

module.exports = function (value) {
	var type;
	if (value === undefined) return '';
	if (value === null) return '0';
	type = typeof value;
	if (type === 'boolean') return '1' + Number(value);
	if (type === 'number') return '2' + String(value);
	if (type === 'string') return '3' + stringify(value).slice(1, -1);
	if (value._type_ && value._id_) return '7' + value._id_;
	if (type === 'function') return '6' + stringify(String(value)).slice(1, -1);
	if (isDate(value)) return '4' + Number(value);
	if (isRegExp(value)) return '5' + stringify(String(value)).slice(1, -1);
	return null;
};
