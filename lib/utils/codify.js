'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')

  , stringify = JSON.stringify;

module.exports = function (value) {
	var type;
	if (value === undefined) return 'undefined';
	if (value === null) return 'null';
	type = typeof value;
	if (type === 'boolean') return value ? 'true' : 'false';
	if (type === 'number') return String(value);
	if (type === 'string') return stringify(value);
	if (isDate(value)) return 'new Date(' + Number(value) + ')';
	if (isRegExp(value)) return String(value);
	if (value._type_ && value.hasOwnProperty('_id_')) {
		return 'getObject(' + stringify(value._id_) + ')';
	}
	if (type === 'function') return String(value);
	return null;
};
