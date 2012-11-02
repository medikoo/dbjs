'use strict';

var extend = require('es5-ext/lib/Object/extend')
  , base   = require('./base');

module.exports = extend(base.create('string'), {
	normalize: function (value) {
		return (value == null) ? value : String(value);
	},
	validate: function (value) {
		return (value == null) ? null : String(value);
	}
});
