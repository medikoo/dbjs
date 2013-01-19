'use strict';

var Db   = require('../../')

  , Base = Db.Base, StringType = Db.String;

module.exports = function (t, a) {
	var ns, item, data;
	ns = Base.create('Relsetitemtest1',
		 { foo: StringType.rel({ multiple: true }) });

	ns.foo = ['one', 'two', 'three'];

	item = ns.foo.getItem('two');

	a(item.obj, ns._foo, "Rel");
	a(item.value, 'two', "Value");
	a.deep(Object.keys(item), ['order'], "Keep meta non enumerable");

	item.order = '43';
	a(item.order, 43, "Order property");

	item.delete();
	a.deep(ns.foo.values.sort(), ['one', 'three']);
	a(item.order, 0, "Delete: relations");

	item = ns.foo.getItem('three');
	data = [];
	item._forEachRelation_(function () { data.push(arguments); });
	a(data.length, 1, "ForEach: Count");
	a.deep(data[0], [item._order, item._order._id_, item], "ForEach: Content");
};
