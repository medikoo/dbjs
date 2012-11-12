'use strict';

var Base = require('./base')

  , normalize = function (value) { return Boolean(value && value.valueOf()); };

module.exports = Base.create('boolean', {
	validate: normalize,
	normalize: normalize
});
