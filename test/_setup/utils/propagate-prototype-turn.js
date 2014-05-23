'use strict';

var d        = require('d')
  , toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type1 = db.Object.extend("Type1")
	  , Type2 = db.Object.extend("Type2")
	  , Type3 = db.Object.extend("Type3")
	  , desc1 = Type1.prototype.$getOwn('foo')
	  , desc3 = Type3.prototype.$getOwn('nesti')
	  , event, obj, obj2, nested;

	desc1.multiple = true;
	Type2.prototype.set('bar', 'elo');
	desc3.nested = true;
	desc3.type = Type1;
	obj = new Type3();

	obj.nesti.on('change', function (e) { event = e; });

	desc3.type = Type2;
	a(event.type, 'batch', "Event type");
	a.deep(toArray(event.deleted), [['foo', obj._getMultiple_('foo')]],
		"Deleted");
	a.deep(toArray(event.set), [['bar', 'elo']], "Set");

	Type1 = db.Object.extend("RevTest1");
	Type2 = db.Object.extend("RevTest2", {
		marko: { type: Type1, reverse: 'hilo', unique: true }
	});

	obj = new db.Object();
	obj._setValue_(Type2.prototype);
	obj2 = new Type1();
	obj.marko = obj2;
	a(obj2.hilo, obj, "Reverse fix");

	// Nested case
	Type2.prototype.define('raz', {
		nested: true
	});
	Object.defineProperty(Type2.prototype.$getOwn('raz'), 'type',
		d(Type3));

	obj = db.Object.newNamed('marko');
	nested = obj._getObject_('raz');
	obj._setValue_(Type2.prototype);
	a(getPrototypeOf(nested).__id__, Type3.prototype.__id__,
		"Switch proto using constant types");

	db.Object.extend('User', {
		dyns: { type: db.Boolean, value: function () {
			return this.multis.some(function () { return true; });
		} },
		multis: { type: db.String, multiple: true }
	});
	obj = new db.User({ multis: ['raz', 'dwa'] });
	obj._setValue_();
	obj._setValue_(db.User.prototype);
	a(obj.dyns, true, "Prototype turn with observables");
};
