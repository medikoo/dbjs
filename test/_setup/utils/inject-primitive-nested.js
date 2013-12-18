'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), m1, m2;

	m1 = obj._getMultipleItems_('test');
	m2 = db.Object.prototype._getMultipleItems_('test');

	a(getPrototypeOf(m1), m2);
};
