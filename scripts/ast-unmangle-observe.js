'use strict';

var forEach  = require('es5-ext/object/for-each')
  , isObject = require('es5-ext/object/is-object')
  , object   = require('es5-ext/object/valid-object')

  , validateMatch = function (obj) {
	if (isObject(obj)) return obj;
	throw new TypeError("AST mismatch");
};

module.exports = function (mangled, unmangled) {
	forEach(object(mangled), function self(value, key) {
		if (!value) return;
		if (typeof value !== 'object') return;
		if (value.type !== 'Identifier') {
			forEach(value, self, validateMatch(this[key]));
			return;
		}
		if (validateMatch(this[key]).name !== '_observe') return;
		value.name = '_observe';
		return;
	}, object(unmangled));
	return mangled;
};
