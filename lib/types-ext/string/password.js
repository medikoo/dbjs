'use strict';

module.exports = require('../../types-base/string').create('Password', {
	min: 5,
	pattern: new RegExp('^[\\u0009 -\\u2027\\u2030-\\uffff]*' +
		'(?=[\\u0009 -\\u2027\\u2030-\\uffff]*\\d)' +
		'(?=[\\u0009 -\\u2027\\u2030-\\uffff]*[a-zA-Z])' +
		'[\\u0009 -\\u2027\\u2030-\\uffff]*$')
});
