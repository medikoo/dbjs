'use strict';

var extend = require('es5-ext/lib/Object/extend')
  , base   = require('./base');

module.exports = extend(base.create('boolean'), {
	normalize: function (value) {
		return (value == null) ? value : Boolean(value && value.valueOf());
	},
	validate: function (value) {
		return (value == null) ? null : Boolean(value && value.valueOf());
	}
});
