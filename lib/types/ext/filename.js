'use strict';

module.exports = require('../string').create('filename', {
	pattern: /^(?:[a-zA-Z]:\\)?[\u0009 -9;-\uffff]*$/,
	min: 1
});
