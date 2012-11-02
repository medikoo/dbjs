'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , validate   = require('es5-ext/lib/Function/valid-function')
  , extend     = require('es5-ext/lib/Object/extend')
  , isString   = require('es5-ext/lib/String/is-string')
  , base       = require('./base')

  , re = new RegExp('^\\s*function[\\0-\'\\)-\\uffff]*' +
		'\\(([\\0-\\(\\*-\\uffff]*)\\)\\s*\\{([\\0-\\uffff]*)\\}\\s*$');

module.exports = extend(base.create('function'), {
	validate: function (value) {
		return (value == null) ? null : validate(value);
	},
	normalize: function (value) {
		var match;
		if (value == null) {
			return value;
		} else if (isFunction(value)) {
			return value;
		} else if (isString(value)) {
			match = value.match(re);
			if (match) {
				try {
					return new Function(match[1], match[2]);
				} catch (e) {}
			}
		}
		return null;
	}
});
