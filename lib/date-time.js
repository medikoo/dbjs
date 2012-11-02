'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , validate = require('es5-ext/lib/Date/valid-date')
  , extend   = require('es5-ext/lib/Object/extend')
  , base     = require('./base');

module.exports = extend(base.create('dateTime'), {
	validate: function (value) {
		return (value == null) ? null : validate(value);
	},
	normalize: function (value) {
		if (value == null) return value;
		return isDate(value) ? value : new Date(value);
	}
});
