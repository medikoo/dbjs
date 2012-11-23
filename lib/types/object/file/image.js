'use strict';

var uInteger = require('../../number/integer/u-integer');

module.exports = require('../file').create('image', {
	width: uInteger,
	height: uInteger
});
