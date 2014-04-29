'use strict';

var isSet    = require('es6-set/is-set')
  , toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc, observable
	  , emitted = null, set, iterator, listener;

	observable = obj._get('test');
	observable.on('change',
		listener = function (event) { emitted = event.newValue; });
	a(observable.value, undefined, "Observable: Value");

	obj.set('test', 234);
	a(emitted, 234, "Observable: Set Value");
	emitted = null;

	desc = db.Object.prototype.$test;
	desc.multiple = true;
	a(isSet(emitted), true, "Observable: Multiple");
	emitted = null;

	obj.test = function () { return [1, 2, 4]; };
	set = obj.test;
	a.deep(toArray(set), [1, 2, 4], "Dynamic multiple");
	a(emitted, set, "Observable: Multiple getter");
	emitted = null;

	iterator = obj.entries();
	obj.set('foo', 'bar');
	a.deep(toArray(iterator).sort(), [['foo', 'bar'], ['test', set]], "Iterator");

	observable.off('change', listener);
	obj.on('change', function (event) { emitted = event; });

	obj.set('foo', 'marko');
	if (emitted) delete emitted.dbjs;
	a.deep(emitted, { type: 'set', key: 'foo', value: 'marko', oldValue: 'bar' },
		"Observable Map");
};
