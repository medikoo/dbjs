'use strict';

var Database = require('../../');

module.exports = function (T, a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, event2;

	event = new T(desc, 'foo', 1000);

	a(obj.test, 'foo', "Property updated");
	a(event.object, desc, "Object");
	a(event.value, 'foo', "Value");
	a(event.stamp, 1000, "Stamp");
	a(event.status, 2, "Status");
	a(String(event), '1000.' + obj.__id__ + '/test.3foo', "toString");

	event = new T(desc, 'bar');
	event2 = new T(desc, 'mirek');
	a(event.stamp, event2.stamp - 1, "Stamp incrementation");
};
