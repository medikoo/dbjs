'use strict';

var getUid   = require('time-uuid/time')
  , Database = require('../');

module.exports = function (a) {
	var db = new Database(), obj1 = new db.Object(), obj2 = new db.Object();

	a(db.objects.has(db.String.prototype), true, "Objects: Native objects");
	a(db.objects.has(obj1) && db.objects.has(obj2), true,
		"Objects: User objects");

	db.unserializeEvent(String(getUid()) + '.' + obj1.__id__ + '/test.3bar');
	a(obj1.test, 'bar', "Unserialize event");

	db._update_(obj1.__id__ + '/test', 'marko');
	a(obj1.test, 'marko', "_update_");
};
