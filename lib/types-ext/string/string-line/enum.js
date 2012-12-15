'use strict';

var StringLine = require('../string-line');

module.exports = StringLine.create('Enum', {
	options: StringLine.rel({ multiple: true, required: true }),
	is: function (value) {
		if (typeof value !== 'string') return false;
		return this.options.has(value);
	},
	normalize: function (value) {
		return this.options.has(value) ? String(value) : null;
	},
	validate: function (value) {
		if (!this.options.has(value)) {
			return new TypeError(value + " is not a valid " + this._id_);
		}
		return null;
	}
});
