'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Type1 = db.Object.extend("Type1")
	  , Type2 = db.Object.extend("Type2")
	  , Type3 = db.Object.extend("Type3")
	  , desc1 = Type1.prototype.$getOwn('foo')
	  , desc3 = Type3.prototype.$getOwn('nesti')
	  , event, obj;

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

	Type3.prototype.$getOwn('marko').multiple = true;
	Type3.prototype.marko.add('foo');
	obj.marko.add('foo');
	obj._setValue_(Type2.prototype);
	a(getPrototypeOf(obj), Type2.prototype, "Multiple turn");

	a.h2("Delete object with desc proto nesteds");
	db.Object.extend('User1', {
		submissions: {
			type: db.Object,
			nested: true
		}
	});
	db.Object.extend('SubmissionFile', {
		thumb: {
			type: db.Object,
			nested: true
		}
	});
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
	obj = new db.User1();
	obj.submissions.foo.files.get('1dwfw').get('thumb').set('bah', 'bar');
	obj.submissions.foo.files.getOwnDescriptor('1dwfw');
	db.objects.delete(obj);
};
