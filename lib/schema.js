'use strict';

var extend = require('es5-ext/lib/Object/extend')
  , base   = require('./base');

module.exports = extend(base.create('schema'), {
	validate: function (value) {
		if (value == null) return null;
		if (!value || !value.__id || value.__ns) {
			throw new TypeError(value + " is not a schema object");
		}
		return value;
	},
	normalize: function (value) {
		if (value == null) return value;
		return (!value.__id || value.__ns) ? null : value;
	}
});
