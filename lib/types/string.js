'use strict';

var base       = require('./base')

  , number     = require('./number')
  , RegExpType = require('./reg-exp');

module.exports = base.create('string', {
	normalize: String,
	validate: function (value) {
		value = String(value);
		if (this.pattern && !value.match(this.pattern)) {
			throw new TypeError(value + ' is not valid ' + this.__id);
		}
		if (this.max && (value.length > this.max)) {
			throw new TypeError(value + ' is too long');
		}
		if (this.min && (value.length < this.min)) {
			throw new TypeError(value + ' is too short');
		}
		return value;
	},
	pattern: RegExpType,
	min: number,
	max: number
});
