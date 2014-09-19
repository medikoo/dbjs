'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event;

	desc.set('raz', 1);
	desc.set('dwa', 2);
	desc.set('trzy', 3);

	desc.on('change', function (e) {
		event = e;
		delete event.dbjs;
	});

	desc.raz = 3;
	a.h1("Event");
	a.deep(event, { type: 'set', key: 'raz', value: 3, oldValue: 1, target: desc });
};
