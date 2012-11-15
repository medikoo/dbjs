'use strict';

var root     = require('../_internals/namespace')
  , Relation = require('../_internals/relation')

  , normalize = function (value) { return Boolean(value && value.valueOf()); }

  , boolean;

module.exports = boolean = root.create('boolean', {
	validate: normalize,
	normalize: normalize
});

// Assign boolean namespace to core properties
Relation.prototype._required.ns = Relation.prototype._multiple.ns = boolean;
