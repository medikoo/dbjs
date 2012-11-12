'use strict';

var Base = require('./base');

module.exports = Base.create('number', {
	normalize: Number,
	validate: Number
});
