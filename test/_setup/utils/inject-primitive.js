'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object();

	obj.$get('test');
	db.Object.prototype.$get('test');

	a(getPrototypeOf(obj.__descriptors__), db.Object.prototype.__descriptors__);
};
