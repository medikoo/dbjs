'use strict';

module.exports = require('../string-line').create('Filename', {
	pattern: /^(?:[a-zA-Z]:\\)?[\u0009 -9;-\uffff]*$/,
	min: 1
});
