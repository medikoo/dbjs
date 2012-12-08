'use strict';

var StringType = require('../../types-base/string');

module.exports = StringType.create('Enum', function (value) {
	value = String(value);
	if (this.options.has(value)) return value;
	throw new TypeError(value + " is not valid " + this._id_);
}, {
	options: StringType.rel({ multiple: true, required: true }),
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
