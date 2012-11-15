'use strict';

var root   = require('../../lib/_internals/namespace')
  , string = require('../../lib/types/string');

require('../../lib/types/number');

module.exports = function (t, a) {
	var ns, item;
	ns = root.abstract('relsetitemtest1',
		 { foo: string.rel({ multiple: true }) });

	ns.foo = ['one', 'two', 'three'];

	item = ns.foo.getItemProperties('two');

	a(item.rel, ns._foo, "Rel");
	a(item.value, 'two', "Value");
	item._value = 34;
	a.deep(Object.keys(item), ['order'], "Keep meta non enumerable");
	a(item.value, '34', "Normalization");

	item.order = '43';
	a(item.order, 43, "Order property");
};
