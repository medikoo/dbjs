'use strict';

var isFunction    = require('es5-ext/lib/Function/is-function')
  , validFunction = require('es5-ext/lib/Function/valid-function')
  , isString      = require('es5-ext/lib/String/is-string')

  , root          = require('../_internals/namespace')
  , Relation      = require('../_internals/relation')

  , functionRe = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$')

  , FunctionType;

module.exports = FunctionType = root.create('Function', {
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

// Assign Function namespace to core properties
root._validate.ns = root._normalize.ns = Relation.prototype._validate.ns =
	FunctionType;
