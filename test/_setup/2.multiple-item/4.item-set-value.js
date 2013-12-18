'use strict';

var toArray  = require('es6-iterator/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , protoDesc, protoSet, set, item, obj1, obj2;

	protoDesc = proto.$getOwn('foo');
	protoDesc.multiple = true;

	set = obj.foo;
	item = set.$getOwn('foo');
	protoSet = proto.foo;
	protoSet.$getOwn('foo');

	a(item._resolveValue_(), undefined, "Initial value");
	protoSet.add('foo');
	a(item._resolveValue_(), true, "Prototype: Add");
	protoSet.delete('foo');
	a(item._resolveValue_(), undefined, "Prototype: Delete");
	set.add('foo');
	a(item._resolveValue_(), true, "Set: Add");

	a.h1("Assignments");
	obj1 = new db.Object();
	obj2 = new db.Object();

	a.deep(toArray(obj1._assignments_), [], "Pre");
	obj.foo.add(obj1);
	a.deep(toArray(obj1._assignments_), [obj.foo.$getOwn(obj1)], "Add");
	obj.foo.add(obj2);
	a.deep(toArray(obj1._assignments_), [obj.foo.$getOwn(obj2)], "Add #2");
	obj.foo.delete(obj1);
	a.deep(toArray(obj1._assignments_), [], "Delete");
};
