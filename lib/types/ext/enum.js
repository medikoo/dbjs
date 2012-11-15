'use strict';

var root    = require('../../_internals/namespace')
  , string  = require('../string');

module.exports = root.create('enum', {
	options: string.rel({ multiple: true, required: true }),
	normalize: function (value) {
		return this.options.has(value) ? string.normalize(value) : null;
	},
	validate: function (value) {
		if (!this.options.has(value)) {
			throw new TypeError(value + " is not a valid option");
		}
		return string.normalize(value);
	}
});
