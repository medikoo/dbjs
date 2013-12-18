'use strict';

var isDate   = require('es5-ext/date/is-date')
  , isRegExp = require('es5-ext/reg-exp/is-reg-exp')
  , contains = require('es5-ext/string/#/contains')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , stringify = JSON.stringify
  , isIdent = RegExp.prototype.test.bind(new RegExp('^[\\t\\v !%-\\)\\+,\\-' +
		':-\\[\\]\\^`-\u2027-\u2030-\uffff][\\t\\v !%-\\)\\+,\\-0-\\[\\]\\^' +
		'`-\u2027-\u2030-\uffff]*$'));

module.exports = function (key) {
	var type;
	if (key == null) return null;
	type = typeof key;
	if (type === 'boolean') return '1' + Number(key);
	if (type === 'number') {
		key = String(key);
		if (!contains.call(key, '.')) return '2' + key;
		return '2' + stringify(key);
	}
	if (type === 'string') {
		if (isIdent(key)) return key;
		return '3' + stringify(key);
	}
	if (hasOwnProperty.call(key, '__id__')) return '7' + key.__id__;
	if (type === 'function') return '6' + stringify(String(key));
	if (isDate(key)) return '4' + Number(key);
	if (isRegExp(key)) return '5' + stringify(String(key));
	return null;
};
