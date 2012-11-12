'use strict';

var isDate   = require('es5-ext/lib/Date/is-date')
  , validate = require('es5-ext/lib/Date/valid-date')
  , Base     = require('./base');

module.exports = Base.create('dateTime', {
	validate: validate,
	normalize: function (value) {
		return isDate(value) ? value : new Date(value);
	}
});
