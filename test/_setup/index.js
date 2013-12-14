'use strict';

var toArray  = require('es6-iterator/to-array')
  , Database = require('../../')
  , Event    = require('../../_setup/event');

module.exports = function (a) {
	var db = new Database(), obj1 = new db.Object(), obj2 = new db.Object(), desc;

	a(db.objects.has(db.String.prototype), true, "Objects: Native objects");
	a(db.objects.has(obj1) && db.objects.has(obj2), true,
		"Objects: User objects");

	a.deep(toArray(db.Object.prototype.__descendants__).sort(),
		[obj1, obj2].sort(), "Descendants");

	a(obj1._db_, db, "Database reference");

	desc = db.Object.prototype.__descriptorPrototype__;
	a(desc.__id__, '$', "Descriptor prototype");
	a(desc.__descriptorPrototype__.__id__, '/', "Descriptor decriptor prototype");
	a(db.Object.prototype.__itemPrototype__.__id__, '*', "Item prototype");

	a(obj1._lastOwnEvent_ instanceof Event, true, "Last own event");
	a(typeof obj1._lastOwnModified_, 'number', "Last own modified");
	a(obj1._lastEvent_ instanceof Event, true, "Last event");
	a(typeof obj1.lastModified, 'number', "Last modified");

	a(obj1._history_[0] instanceof Event, true, "History");

	a(db.objects.unserialize(obj1.__id__), obj1, "Unserialize");

	a.h1("Kind");
	a(obj1._kind_, 'object', "Object");
	a(db.Object._kind_, 'object', "Type");
	a(obj1.$get('foo')._kind_, 'descriptor', "Descriptor");
	a(obj1.$get('foo').$get('bar')._kind_, 'sub-descriptor', "Sub Descriptor");
	a(obj1._getMultiple_('3bar').$get('bar')._kind_, 'item', "Multiple item");
};
