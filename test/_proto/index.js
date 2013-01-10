'use strict';

var Db = require('../../');

module.exports = function () {
	return {
		lastModified: function (a) {
			var obj = Db();
			a(typeof obj._lastModified_, 'number', "Object");
			a(typeof Db.create('ProtoIndexTest')._lastModified_, 'number',
				"Constructor");
		}
	};
};
