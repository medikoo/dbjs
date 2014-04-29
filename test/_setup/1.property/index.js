'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , event;

	obj.set('raz', 1);
	obj.set('dwa', 2);
	obj.set('trzy', 3);

	proto.set('test', function () { return this.raz + this.dwa + this.trzy; });

	obj.on('change', function (e) {
		event = e;
		delete event.dbjs;
	});

	obj.raz = 3;
	a.h1("Event");
	a(event.type, 'batch', "Type");
	a.deep(toArray(event.set), [['raz', 3], ['test', 8]], "Set");
	a.deep(toArray(event.deleted), [['raz', 1], ['test', 6]], "Deleted");
};
