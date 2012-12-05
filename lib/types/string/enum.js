'use strict';

var string = require('../string');

module.exports = string.create('enum', function self(value) {
	value = String(value);
	if (self.options.has(value)) return value;
	throw new TypeError(value + " is not valid " + self._id_);
}, {
	options: string.rel({ multiple: true, required: true }),
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
	}
});
