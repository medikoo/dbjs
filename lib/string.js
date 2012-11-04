'use strict';

var base   = require('./base');

module.exports = base.create('string', {
	normalize: String,
	validate: String
});
