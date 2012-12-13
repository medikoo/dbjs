'use strict';

var filename   = require('../string/string-line/filename')
  , url        = require('../string/string-line/url');

module.exports = require('../../types-base/object').create('File',
	function (data) {
		if (typeof data === 'string') {
			this.dir = data;
			return;
		}
		this.ns.Object.prototype.$construct.call(this, data);
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
