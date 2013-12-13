'use strict';

var Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , protoDesc, protoSet, set, item, protoItem;

	protoDesc = proto.$get('foo');
	protoDesc.multiple = true;

	set = obj.foo;
	item = set.$get('foo');
	protoSet = proto.foo;
	protoItem = protoSet.$get('foo');

	a(getPrototypeOf(item), protoItem, "Item prototype");
	a(item._resolveValue_(), undefined, "Initial value");
	protoSet.add('foo');
	a(item._resolveValue_(), true, "Prototype: Add");
};
