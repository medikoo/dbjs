'use strict';

module.exports = require('../../types/string').create('StringLine', {
	pattern: /^[\u0009 -\u2027\u2030-\uffff]*$/
});
