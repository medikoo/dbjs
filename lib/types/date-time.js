'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , validate = require('es5-ext/lib/Date/valid-date')
  , base     = require('./base');

module.exports = base.create('DateTime', {
	validate: validate,
	normalize: function (value) {
		return isDate(value) ? value : new Date(value);
	}
});
