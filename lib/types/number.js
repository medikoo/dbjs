'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , root   = require('./root')

  , number;

module.exports = number = root.create('number', function (value) {
	if (isNaN(value)) throw new TypeError(value + " is not a number");
	return Number(value);
}, {
	is: function (value) { return (typeof value === 'number') && !isNaN(value); },
	validate: function (value) {
		if (isNaN(value)) return new TypeError(value + " is not a number");
	},
	normalize: function (value) { return isNaN(value) ? null : Number(value); }
});

Object.defineProperties(number, {
	coerce: d('c', number._normalize),
	__serialize: d('c', function (value) { return '2' + value; })
});

extend(number, Number);
extend(number.prototype, Number.prototype);
