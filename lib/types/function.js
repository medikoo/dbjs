'use strict';

var isFunction    = require('es5-ext/lib/Function/is-function')
  , validFunction = require('es5-ext/lib/Function/valid-function')
  , isString      = require('es5-ext/lib/String/is-string')

  , Base          = require('./base')

  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')

  , FunctionType;

module.exports = FunctionType = Base.create('function', {
	validate: validFunction,
	normalize: function (value) {
		var match;
		if (isFunction(value)) {
			return value;
		} else if (isString(value)) {
			match = value.match(functionRe);
			if (match) {
				try {
					return new Function(match[1], match[2]);
				} catch (e) {}
			}
		}
		return null;
	}
});
