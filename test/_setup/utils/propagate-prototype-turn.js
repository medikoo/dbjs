'use strict';

var d        = require('d')
  , toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../')
  , Event    = require('../../../_setup/event')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type1 = db.Object.extend("Type1")
	  , Type2 = db.Object.extend("Type2")
	  , Type3 = db.Object.extend("Type3")
	  , desc1 = Type1.prototype.$getOwn('foo')
	  , desc3 = Type3.prototype.$getOwn('nesti')
	  , event, obj, obj2, nested, desc;

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

	a.h1("Nested turn");
	db.Object.extend('User2', {
		submissions: {
			type: db.Object,
			nested: true
		}
	});
	db.User2.prototype.submissions.define('foo', {
		type: db.Object,
		nested: true
	});

	a.h2("From Base");
	obj = db.User2.prototype.submissions.foo;
	event = new Event(db.objects.unserialize('2f3oio7k0ic/submissions/foo/something'),
		true, 234234);
	obj = db.objects.unserialize('2f3oio7k0ic');
	obj._setValue_(db.User2.prototype);
	a(getPrototypeOf(obj.submissions), db.User2.prototype.submissions, "#1");
	a(getPrototypeOf(obj.submissions.foo).__id__, db.User2.prototype.submissions.foo.__id__, "#2");

	a.h2("Nested proto switch");
	db.Object.extend('User1', {
		submissions: {
			type: db.Object,
			nested: true
		}
	});
	db.Object.extend('SubmissionFile');
	db.Object.extend('Submission', {
		files: {
			type: db.Object,
			nested: true
		}
	});
	db.Submission.prototype.files._descriptorPrototype_.setProperties({
		nested: true,
		type: db.SubmissionFile
	});
	db.User1.prototype.submissions.define('foo', {
		type: db.Submission,
		nested: true
	});
	db.User1.prototype.submissions.foo; //jslint: ignore
	obj._setValue_(db.User1.prototype);
	a(getPrototypeOf(obj.submissions), db.User1.prototype.submissions, "#1");
	a(getPrototypeOf(obj.submissions.foo).__id__, db.User1.prototype.submissions.foo.__id__, "#2");

	a.h2("Descriptor proto switch");
	desc = db.objects.unserialize('45lxo6fpa0i/submissions/foo/files/m4lcpahhx3or/' +
		'isPreviewGenerated');
	desc._setValue_(false);
	obj = desc.object;
	a(obj.constructor.__id__, 'Base');
	a(obj.master.constructor.__id__, 'Object');
	obj.master._setValue_(db.User1.prototype);
	a(obj.constructor.__id__, 'SubmissionFile');
	a(obj.master.constructor.__id__, 'User1');
};
