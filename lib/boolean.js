'use strict';

var base = require('./base')

  , normalize = function (value) { return Boolean(value && value.valueOf()); };

module.exports = base.create('boolean', {
	normalize: normalize,
	validate: normalize
});
