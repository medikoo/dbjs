'use strict';

var Db = require('../../');

module.exports = function () {
	return {
		lastModified: function (a) {
			var obj = Db();
			a(typeof obj.lastModified, 'number', "Object");
			a(typeof Db.create('ProtoIndexTest').lastModified, 'number',
				"Constructor");
		}
	};
};
