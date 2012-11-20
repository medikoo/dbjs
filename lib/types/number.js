'use strict';

var root       = require('./root')
  , RelSetItem = require('../_internals/rel-set-item')

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

// Assign number namespace to core properties
RelSetItem.prototype._order.ns = number;
