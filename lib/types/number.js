'use strict';

var root = require('../_internals/namespace');

module.exports = root.create('number', {
	normalize: Number,
	validate: Number
});
