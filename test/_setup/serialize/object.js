'use strict';

var Database = require('../../../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test');

	a(t(obj), obj.__id__, "Object");
	a(t(desc), desc.__id__, "Descriptor");
};
