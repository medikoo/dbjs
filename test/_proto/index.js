'use strict';

var Db       = require('../../')

  , keys = Object.keys
  , Base = Db.Base, StringType = Db.String;

module.exports = function () {
	return {
		lastModified: function (a) {
			var other, obj = Db();
			a(typeof obj.lastModified, 'number', "Object");
			a(typeof Db.create('ProtoIndexTest').lastModified, 'number',
				"Constructor");
		}
	};
};
