'use strict';

var primitiveSet = require('es5-ext/object/primitive-set')
  , d            = require('d')
  , isSet        = require('es6-set/is-set')
  , isObservable = require('observable-value/is-observable-value')
  , Database     = require('../../../')

  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys;

module.exports = function (a) {
	var db = new Database(), obj = new db.Object(), protoDesc, desc, args
	  , x = {}, i, Type = db.Object.extend('CustomType');

	protoDesc = db.Object.prototype.$getOwn('foo');
	desc = obj.$getOwn('foo');
	a(getPrototypeOf(desc), protoDesc, "Descriptor");
	a(obj.$getOwn('foo'), desc, "Return already created");
	a(obj._getCurrentDescriptor_(protoDesc._sKey_), desc, "Get current");
	defineProperty(obj, 'foo', d('bar'));
	a(obj._getCurrentDescriptor_(protoDesc._sKey_), null, "Native value");

	a(typeof obj._getObject_(desc._sKey_), 'object', "Nested");
	a(isObservable(obj._getObservable_(desc._sKey_)), true, "Observable");
	a(isSet(obj._getDynamicMultiple_(desc._sKey_)), true, "Dynamic multiple");

	a.h1("forEachOwnDescriptor");
	db.Object.prototype.set('raz', 'dwa');
	obj.set('miszka', 'raz');

	args = primitiveSet('foo', 'miszka');
	i = 0;
	obj._forEachOwnDescriptor_(function (desc, key) {
		if (!args[key]) {
			a.never();
			return;
		}
		delete args[key];
		++i;
		a(desc._sKey_, key, "Descriptor #" + i);
		a(this, x, "Context #" + i);
	}, x);
	a(keys(args).length, 0, "All processed");

	a.h1("forEachOwnNestedObjects");
	db.Object.prototype._getObject_('raz');
	obj._getObject_('dwa');
	obj._getObject_('trzy');

	args = primitiveSet('foo', 'dwa', 'trzy');
	i = 0;
	obj._forEachOwnNestedObject_(function (nObj, key) {
		if (!args[key]) {
			a.never();
			return;
		}
		delete args[key];
		++i;
		a(obj._getObject_(key), nObj, "Object #" + i);
		a(this, x, "Context #" + i);
	}, x);
	a(keys(args).length, 0, "All processed");

	a.h1("Constant override");
	defineProperty(Type.prototype, 'foo', d(true));
	obj = new Type();
	a(obj._get('foo'), true);
	a(obj._foo, true, "Accessor");

	a.h1("Nested inheritance");
	Type.prototype.define('nTest', {
		nested: true,
		type: db.Object
	});
	Type.prototype.nTest.define('foo', {
		type: db.Number,
		value: 12
	});
	obj = new Type();
	a(obj.nTest.foo, 12);

	Type.prototype.define('n2Test', {
		nested: true
	});
	Object.defineProperty(Type.prototype.$n2Test, 'type', d(db.Object));
	obj = new Type();
	a(getPrototypeOf(obj.n2Test), db.Object.prototype, "Constant type");

	db.Object.extend('Document', {
		uniqueKey: { value: function () { return this.key; } }
	});
	db.Object.extend('Submission', {
		document: {
			nested: true,
			type: db.Document
		}
	});
	db.Submission.prototype.document.uniqueKey = function () { return this.owner.key; };

	db.Object.extend('User', {
		documents: {
			nested: true,
			type: db.Object
		},
		submissions: {
			nested: true,
			type: db.Object
		}
	});

	db.User.prototype.documents.define('someDocument', {
		nested: true,
		type: db.Document
	});
	db.User.prototype.submissions.define('someSubmission', {
		nested: true,
		type: db.Submission
	});

	var user = new db.User();
	a(user.documents.someDocument.uniqueKey, 'someDocument');
	a(user.submissions.someSubmission.document.uniqueKey, 'someSubmission');
};
