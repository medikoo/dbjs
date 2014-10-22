'use strict';

var Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc = obj.$getOwn('test')
	  , event, nObj, obj2;

	desc.type = db.Object;
	obj2 = new db.Object();
	obj.test = obj2;
	desc.nested = true;
	nObj = obj.test;
	a(db.Object.is(nObj), true, "Nested");

	obj._test.on('change', function (e) { event = e; });
	desc.nested = false;
	a.deep(event, { type: 'change', newValue: obj2, oldValue: nObj,
		dbjs: event.dbjs, target: obj._test }, "Force udpate");
	a(obj.test, obj2, "Nested: false");

	db.Object.extend('SubSection');
	db.SubSection.prototype.define('nestedMap', {
		nested: true,
		type: db.Object
	});
	db.SubSection.prototype.nestedMap._descriptorPrototype_.setProperties({
		nested: true,
		type: db.Object
	});
	db.SubSection.prototype.nestedMap.define('foo', { type: db.Object });
	a(db.SubSection.prototype.nestedMap.foo.__id__, 'SubSection#/nestedMap/foo');

	db.SubSection.extend('SubObject');
	a(db.SubObject.prototype.nestedMap.foo.__id__, 'SubObject#/nestedMap/foo');
	db.SubObject.prototype.nestedMap.getOwnDescriptor('foo').nested = false;
	db.SubObject.prototype.nestedMap.foo = null;
	a(db.SubObject.prototype.nestedMap.foo, null);
	a(db.SubObject.prototype.nestedMap.size, 1);
};
