'use strict';

var Base   = require('../../lib/types-base/base')
  , string = require('../../lib/types-base/string');

require('../../lib/types-base/number');

module.exports = function (t, a) {
	var ns, item, data;
	ns = Base.create('Relsetitemtest1',
		 { foo: string.rel({ multiple: true }) });

	ns.foo = ['one', 'two', 'three'];

	item = ns.foo.get('two');

	a(item.obj, ns._foo, "Rel");
	a(item.value, 'two', "Value");
	item._value = 34;
	a.deep(Object.keys(item), ['order'], "Keep meta non enumerable");
	a(item.value, '34', "Normalization");

	item.order = '43';
	a(item.order, 43, "Order property");

	item.delete();
	a.deep(ns.foo.values.sort(), ['one', 'three']);

	item = ns.foo.get('three');
	data = [];
	item._forEachObject_(function () { data.push(arguments); });
	a(data.length, 1, "ForEach: Count");
	a.deep(data[0], [item._order, item._order._id_, item], "ForEach: Content");
};
