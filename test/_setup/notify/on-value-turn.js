'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type1 = db.Object.extend("Type1")
	  , Type2 = db.Object.extend("Type2")
	  , Type3 = db.Object.extend("Type3")
	  , desc1 = Type1.prototype.$getOwn('foo')
	  , obj1, obj2, event;

	desc1.type = Type2;
	obj1 = new Type1();
	obj1.foo = obj2 = new Type2();
	a(obj1.foo, obj2, "Init");

	obj1._foo.on('change', function (e) {
		event = e;
	});

	obj2._setValue_(Type3.prototype);

	a.deep(event, { type: 'change', newValue: null, oldValue: obj2, target: obj1._foo }, "Event");
	a(obj1.foo, null, "Value");
};
