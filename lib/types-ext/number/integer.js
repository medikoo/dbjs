'use strict';

module.exports = require('../../types-base/number').create('Integer',
	function (value) {
		var error = this.validate(value);
		if (error) throw error;
		return this.normalize(value);
	}, {
		$construct: function (value) {
			value = Number(value);
			if (value % 1) {
				return ((value > 0) ? 1 : -1) * Math.floor(Math.abs(value));
			}
			return value;
		},
		is: function (value) {
			return this.Number.is.call(this, value) && ((value % 1) === 0);
		},
		normalize: function (value) {
			value = this.Number.normalize.call(this, value);
			if (value && (value % 1)) {
				return ((value > 0) ? 1 : -1) * Math.floor(Math.abs(value));
			}
			return value;
		}
	});
