'use strict';

var Database = require('../../')
  , Event    = require('../../_setup/event');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event1, event2, event3, event5, dbEvents = [], objEvents = [];

	db.objects.on('update', function (event) { dbEvents.push(event); });
	obj.on('update', function (event) { objEvents.push(event); });

	a.h1("#1");
	event1 = new Event(desc, 'foo', 1000);
	a.deep(dbEvents, [event1], "Db");
	a.deep(objEvents, [event1], "Object");

	a.h1("#2");
	event2 = new Event(desc, 'bar', 2000);
	a.deep(dbEvents, [event1, event2], "Db");
	a.deep(objEvents, [event1, event2], "Object");

	a.h1("#3");
	event3 = new Event(desc, 'mirek', 1500);
	a.deep(dbEvents, [event1, event2], "Db");
	a.deep(objEvents, [event1, event2], "Object");

	a.h1();
	a.deep(desc._history_, [event2, event3, event1], "History");

	new Event(desc, 'mirek', 1500); //jslint: skip
	a.deep(desc._history_, [event2, event3, event1],  "Same");
	event5 = new Event(desc, 'mirekd', 1500);
	a.deep(desc._history_, [event2, event5, event3, event1],
		"Same stamp, other value");

	a.deep(dbEvents, [event1, event2], "Db events");
	a.deep(objEvents, [event1, event2], "Object events");
};
