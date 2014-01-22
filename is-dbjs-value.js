'use strict';

var isDate       = require('es5-ext/date/is-date')
  , primitiveSet = require('es5-ext/object/primitive-set')
  , isRegExp     = require('es5-ext/reg-exp/is-reg-exp')
  , isDbKind     = require('./is-dbjs-kind')

  , accepted = primitiveSet('boolean', 'number', 'string', 'function');

module.exports = function (value) {
	var type;
	if (value == null) return true;
	type = typeof value;
	if (accepted[type]) return true;
	if (type !== 'object') return false;
	if (isDbKind(value)) return true;
	if (isDate(value)) return true;
	if (isRegExp(value)) return true;
	return false;
};
