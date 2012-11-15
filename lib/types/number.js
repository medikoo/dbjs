'use strict';

var root       = require('../_internals/namespace')
  , RelSetItem = require('../_internals/rel-set-item')

  , number;

module.exports = number = root.create('number', {
	normalize: Number,
	validate: Number
});

// Assign number namespace to core properties
RelSetItem.prototype._order.ns = number;
