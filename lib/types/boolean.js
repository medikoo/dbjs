'use strict';

var root     = require('../_internals/namespace')
  , Relation = require('../_internals/relation')

  , boolean;

module.exports = boolean = root.create('boolean', function (value) {
	return Boolean(value && value.valueOf());
}, {
	is: function (value) { return (typeof value === 'boolean'); },
	normalize: function (value) { return Boolean(value && value.valueOf()); }
});

// Assign boolean namespace to core properties
Relation.prototype._required.ns = Relation.prototype._multiple.ns = boolean;
