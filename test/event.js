'use strict';

var Db = require('../');

module.exports = function (t, a) {
	var obj = Db(), event = new t(obj, Db.prototype, 123);

	a(String(event), '123.' + obj._id_ + '.7Object#', "toString");
};
