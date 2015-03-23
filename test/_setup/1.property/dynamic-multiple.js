'use strict';

var isSet    = require('es6-set/is-set')
  , toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , desc, event, set, obj2, obj3;

	desc = proto.$getOwn('test');
	desc.multiple = true;

	obj.set('raz', 1);
	obj.set('dwa', 2);
	obj.set('trzy', 3);

	proto.test = function () { return [this.raz, this.dwa, this.trzy]; };

	set = obj.test;
	a(isSet(set), true, "Set");
	a.deep(toArray(obj.test), [1, 2, 3], "Value");
	a(String(obj.test), '1, 2, 3', "toString");

	set.on('change', function (e) {
		event = e;
		delete event.dbjs;
	});
	obj.raz = 3;
	a.deep(event, { type: 'delete', value: 1, target: set }, "Delete event");
	obj.raz = 5;
	a.deep(event, { type: 'add', value: 5, target: set }, "Add event");
	a.deep(toArray(obj.test), [5, 2, 3], "Mantain order");

	obj2 = new db.Object();
	obj3 = new db.Object();
	proto.define('resolutionTest', {
		type: db.String,
		multiple: true,
		value: function () { return [obj, obj2, obj3]; }
	});

	a.deep(toArray(obj2.resolutionTest), [obj, obj2, obj3].map(String));
	a.deep(toArray(obj2.resolutionTest), [obj, obj2, obj3].map(String));
};
