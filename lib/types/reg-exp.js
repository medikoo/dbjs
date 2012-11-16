'use strict';

var isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')
  , root     = require('../_internals/namespace');

module.exports = root.create('RegExp', function (value) {
	if (isRegExp(value)) return value;
	try {
		return RegExp(value);
	} catch (e) {
		throw new TypeError(value + " is not regexp representation");
	}
}, {
	is: isRegExp,
	validate: function (value) {
		if (isRegExp(value)) return;
		try {
			RegExp(value);
		} catch (e) {
			return new TypeError(value + " is not regexp representation");
		}
	},
	normalize: function (value) {
		if (isRegExp(value)) return value;
		try {
			return RegExp(value);
		} catch (e) {
			return null;
		}
	}
});
