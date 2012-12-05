'use strict';

module.exports = require('../number').create('integer', function self(value) {
	var error = self.validate(value);
	if (error) throw error;
	return self.normalize(value);
}, {
	is: function (value) {
		return this.number.is.call(this, value) && ((value % 1) === 0);
	},
	normalize: function (value) {
		value = this.number.normalize.call(this, value);
		if (value && (value % 1)) {
			return ((value > 0) ? 1 : -1) * Math.floor(Math.abs(value));
		}
		return value;
	}
});
