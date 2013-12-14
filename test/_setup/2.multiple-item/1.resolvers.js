'use strict';

var primitiveSet = require('es5-ext/object/primitive-set')
  , isObservable = require('observable-value/is-observable-value')
  , Database     = require('../../../')

  , keys = Object.keys, getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , protoDesc, protoSet, set, item, protoItem, args, i, x = {};

	protoDesc = proto.$get('foo');
	protoDesc.multiple = true;

	set = obj.foo;
	item = set.$get('foo');
	protoSet = proto.foo;
	protoItem = protoSet.$get('foo');

	a(getPrototypeOf(item), protoItem, "Item prototype");
	a(isObservable(set._get('foo')), true, "Observable");

	a.h1("forEachOwnItem");
	obj._getMultipleItem_('3raz', 'dwa', '3dwa');
	obj._getMultipleItem_('3trzy', 'trzy', '3trzy');
	args = primitiveSet('3foo.3foo', '3raz.3dwa', '3trzy.3trzy');
	i = 0;
	obj._forEachOwnItem_(function (item, key) {
		var argKey = item._pKey_ + '.' + item._sKey_;
		if (!args[argKey]) {
			a.never();
			return;
		}
		delete args[argKey];
		++i;
		a(item._sKey_, key, "Item #" + i);
		a(this, x, "Context #" + i);
	}, x);
	a(keys(args).length, 0, "All processed");
};
