'use strict';

var aFrom    = require('es5-ext/array/from')
  , toArray  = require('es5-ext/array/to-array')
  , isSet    = require('es6-set/is-set')
  , Database = require('../../../');

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), desc, observable
	  , emitted = null, set, iterator, listener, obj1, obj2;

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
	a.deep(emitted, { type: 'set', key: 'foo', value: 'marko', oldValue: 'bar', target: obj },
		"Observable Map");

	a.h1("Assignments");
	obj1 = new db.Object();
	obj2 = new db.Object();

	a.deep(toArray(obj1._assignments_), [], "Pre");
	obj.set('assitest', obj1);
	a.deep(toArray(obj1._assignments_), [obj.$assitest], "Set");
	obj.assitest = obj2;
	a.deep(toArray(obj1._assignments_), [], "Reset #1");
	a.deep(toArray(obj2._assignments_), [obj.$assitest], "Reset #1");
	obj.delete('assitest');
	a.deep(toArray(obj2._assignments_), [], "Delete");

	a.h1("Same value set");
	db.Object.prototype.define('multiChangeTest', {
		multiple: true,
		type: db.String,
		value: function () { return ['raz']; }
	});

	a.deep(aFrom(obj1._multiChangeTest.value), ['raz']);
	obj1.multiChangeTest = [];
	a.deep(aFrom(obj1._multiChangeTest.value), []);
	// Ensure setting same value low-level way does not override internal value for observable
	// (case applicable to multiple)
	obj1.$multiChangeTest._setValue_(null);
	a.deep(aFrom(obj1._multiChangeTest.value), []);
};
