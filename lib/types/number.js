'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , base   = require('./base')

  , number;

module.exports = number = base.create('number', function self(value) {
	var error = self.validate(value);
	if (error) throw error;
	return Number(value);
}, {
	is: function (value) {
		return (typeof value === 'number') && (this.min < value) &&
			(this.max > value);
	},
	validate: function (value) {
		if (isNaN(value) || (this.min > value) || (this.max < value)) {
			return new TypeError(value + " is invalid " + this.__id);
		}
	},
	normalize: function (value) {
		return (isNaN(value) || (this.min > value) || (this.max < value)) ? null :
				Number(value);
	},
	min: -Infinity,
	max: Infinity
});

Object.defineProperties(number, {
	coerce: d('c', function (value) {
		return isNaN(value) ? null : Number(value);
	}),
	__serialize: d('c', function (value) { return '2' + value; })
});

extend(number, Number);
extend(number.prototype, Number.prototype);
