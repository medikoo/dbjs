'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , protoDesc, protoSet, set, item, protoItem;

	protoDesc = proto.$getOwn('foo');
	protoDesc.multiple = true;

	set = obj.foo;
	item = set.$getOwn('foo');
	protoSet = proto.foo;
	protoItem = protoSet.$getOwn('foo');

	a(getPrototypeOf(item), protoItem, "Item prototype");
	a(item._resolveValue_(), undefined, "Initial value");
	protoSet.add('foo');
	a(item._resolveValue_(), true, "Prototype: Add");

	db.Object.prototype.define('dates', {
		multiple: true,
		type: db.DateTime
	});
	obj = db.objects.unserialize('Object#/dates*41420070400000');
	a(obj.key instanceof db.DateTime, true);
};
