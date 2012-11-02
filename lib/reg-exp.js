'use strict';

var isRegExp = require('es5-ext/lib/RegExp/is-reg-exp')
  , validate = require('es5-ext/lib/RegExp/valid-reg-exp')
  , extend   = require('es5-ext/lib/Object/extend')
  , base     = require('./base');

module.exports = extend(base.create('regExp'), {
	validate: function (value) {
		return (value == null) ? null : validate(value);
	},
	normalize: function (value) {
		if (value == null) {
			return value;
		} else if (isRegExp(value)) {
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
