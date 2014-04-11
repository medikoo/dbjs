'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type1, obj;

	Type1 = db.Object.extend('Type1', {
		foo: { type: db.Number }
	});
	obj = new db.Object();

	a(obj.$getOwn('foo').type, db.Base, "Pre");
	obj._setValue_(Type1.prototype);
	a(obj.$getOwn('foo').type, db.Number, "Post");
};
