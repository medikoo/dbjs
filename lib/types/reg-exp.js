'use strict';

var isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')
  , validate = require('es5-ext/lib/RegExp/valid-reg-exp')
  , root     = require('../_internals/namespace');

module.exports = root.create('RegExp', {
	validate: validate,
	normalize: function (value) {
		if (isRegExp(value)) {
			return value;
		} else {
			try {
				return RegExp(value);
			} catch (e) {
				return null;
			}
		}
	}
});
