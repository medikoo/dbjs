'use strict';

var filename   = require('./filename')
  , url        = require('./url');

module.exports = require('../object').create('File', function (data) {
	if (typeof data === 'string') {
		this.dir = data;
		return;
	}
	this.ns.Object.construct.call(this, data);
}, {
	dir: filename.required,
	url: url
}, {
	dir: filename.rel('/'),
	url: url.rel({ value: '/' }),
	verify: function (data) {
		if (typeof data === 'string') {
			return this.validatePropertyNew('dir', data);
		}
		return this.Object.verify.call(this, data);
	}
});
