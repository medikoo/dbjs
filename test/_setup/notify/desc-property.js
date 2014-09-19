'use strict';

var toArray    = require('es5-ext/array/to-array')
  , Database   = require('../../../')
  , getBaseMap = require('../3.descriptor-property/_get-base-map');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc, observable
	  , emitted = null, iterator, listener;

	desc = obj.$getOwn('test');
	observable = desc._get('test');
	observable.on('change',
		listener = function (event) { emitted = event.newValue; });
	a(observable.value, undefined, "Observable: Value");

	desc.set('test', 234);
	a(emitted, 234, "Observable: Set Value");
	emitted = null;

	iterator = desc.entries();
	desc.set('foo', 'bar');
	a.deep(toArray(iterator), getBaseMap(desc).concat([['test', 234],
		['foo', 'bar']]), "Iterator");

	observable.off('change', listener);
	desc.on('change', function (event) { emitted = event; });

	desc.set('foo', 'marko');
	if (emitted) delete emitted.dbjs;
	a.deep(emitted, { type: 'set', key: 'foo', value: 'marko', oldValue: 'bar', target: desc },
		"Observable Map");
};
