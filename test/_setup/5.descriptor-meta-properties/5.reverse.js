'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), Type1 = db.Object.extend("Object1")
	  , Type2 = db.Object.extend("Object2"), obj1 = new Type1()
	  , desc = Type1.prototype.$get('test'), obj2 = new Type2(), Type3
	  , event;

	desc.type = Type2;
	desc.unique = true;
	desc.reverse = 'mamba';
	obj1.test = obj2;
	a(obj2.mamba, obj1, "Reverse");

	Type3 = Type1.extend('Object3');
	a(Type3.prototype.$test.reverse, undefined, "No inheritance");

	obj2._mamba.on('change', function (e) { event = e; });
	desc.delete('reverse');
	a.deep(event, { type: 'change', newValue: undefined, oldValue: obj1,
		dbjs: event.dbjs }, "Force udpate");
	a(obj2.mamba, undefined, "Reverse: false");
};
