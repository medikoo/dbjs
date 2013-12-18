'use strict';

var primitiveSet = require('es5-ext/object/primitive-set')
  , isObservable = require('observable-value/is-observable-value')
  , Database     = require('../../../')

  , keys = Object.keys, getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), proto = db.Object.prototype, obj = new db.Object()
	  , protoDesc, protoSet, set, item, protoItem, args, i, x = {};

	protoDesc = proto.$getOwn('foo');
	protoDesc.multiple = true;

	set = obj.foo;
	item = set.$getOwn('foo');
	protoSet = proto.foo;
	protoItem = protoSet.$getOwn('foo');

	a(getPrototypeOf(item), protoItem, "Item prototype");
	a(isObservable(set._get('foo')), true, "Observable");

	a.h1("forEachOwnItem");
	obj._getOwnMultipleItem_('raz', 'dwa', 'dwa');
	obj._getOwnMultipleItem_('trzy', 'trzy', 'trzy');
	args = primitiveSet('foo.foo', 'raz.dwa', 'trzy.trzy');
	i = 0;
	obj._forEachOwnItem_(function (item, key) {
		var argKey = item._pSKey_ + '.' + item._sKey_;
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
