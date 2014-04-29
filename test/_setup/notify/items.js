'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object()
	  , desc = db.Object.prototype.$getOwn('test'), iterator, event;

	desc.multiple = true;

	obj.test = ['raz', 2, 'trzy', 4];
	obj.test.on('change', function (e) { event = e; });
	iterator = obj.test.values();

	desc.type = db.Number;

	a.deep(toArray(iterator), [2, 4], "Modified");
	a.h1("Event");
	a(event.type, 'batch', "Type");
	a.deep(toArray(event.deleted), ['raz', 'trzy'], "Deleted");
	a(event.added, undefined, "Added");
};
