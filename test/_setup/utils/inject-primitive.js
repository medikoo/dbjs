'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object();

	obj.$getOwn('test');
	db.Object.prototype.$getOwn('test');

	a(getPrototypeOf(obj.__descriptors__), db.Object.prototype.__descriptors__);
};
