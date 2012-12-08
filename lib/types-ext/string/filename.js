'use strict';

module.exports = require('../../types-base/string').create('Filename', {
	pattern: /^(?:[a-zA-Z]:\\)?[\u0009 -9;-\uffff]*$/,
	min: 1
});
