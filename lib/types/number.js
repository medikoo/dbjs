'use strict';

var base = require('./base');

module.exports = base.create('number', {
	normalize: Number,
	validate: Number
});
