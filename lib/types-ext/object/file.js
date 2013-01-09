'use strict';

var filename   = require('../string/string-line/filename')
  , url        = require('../string/string-line/url');

module.exports = require('../../types/object').create('File',
	function (data) {
		if (typeof data === 'string') {
			this.dir = data;
			return;
		}
		this.ns.Object.prototype.$construct.call(this, data);
	}, {
		dir: filename.required,
		url: url,
		validateConstruction: function (data) {
			if (typeof data === 'string') {
				return this.validateCreateProperty('dir', data);
			}
			return this.ns.Object.prototype.validateConstruction.call(this, data);
		}
	}, {
		dir: filename.rel('/'),
		url: url.rel({ value: '/' })
	});
