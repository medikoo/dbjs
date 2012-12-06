'use strict';

var Base   = require('../../lib/types/base')
  , string = require('../../lib/types/string');

require('../../lib/types/number');

module.exports = function (t, a) {
	var ns, item;
	ns = Base.abstract('Relsetitemtest1',
		 { foo: string.rel({ multiple: true }) });

	ns.foo = ['one', 'two', 'three'];

	item = ns.foo.getItemProperties('two');

	a(item.rel, ns._foo, "Rel");
	a(item.value, 'two', "Value");
	item._value = 34;
	a.deep(Object.keys(item), [], "Keep meta non enumerable");
	a(item.value, '34', "Normalization");

	item.order = '43';
	a(item.order, 43, "Order property");
};
