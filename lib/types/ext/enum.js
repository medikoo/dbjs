'use strict';

var root    = require('../root')
  , string  = require('../string');

module.exports = root.create('enum', function self(value) {
	value = String(value);
	if (self.options.has(value)) return value;
	throw new TypeError(value + " is not valid " + self.__id);
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
			return new TypeError(value + " is not a valid " + this.__id);
		}
	}
});
