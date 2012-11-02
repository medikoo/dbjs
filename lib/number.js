'use strict';

var extend = require('es5-ext/lib/Object/extend')
  , base   = require('./base');

module.exports = extend(base.create('number'), {
	normalize: function (value) {
		return (value == null) ? value : Number(value);
	},
	validate: function (value) {
		return (value == null) ? null : Number(value);
	}
});
