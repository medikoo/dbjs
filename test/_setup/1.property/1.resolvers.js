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

	db = new Database();
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

	db = new Database();
	db.Object.extend('Raz', {
		foo: {
			type: db.Object,
			nested: true
		}
	});
	db.Raz.prototype.get('foo');
	db.Raz.extend('Dwa');
	db.Dwa.prototype.get('foo');
	a(getPrototypeOf(db.Dwa.prototype.get('foo')), db.Raz.prototype.foo);
	db.Dwa.prototype.getOwnDescriptor('foo').type = db.Object;
	a(getPrototypeOf(db.Dwa.prototype.foo), db.Object.prototype);
	a(db.Dwa.prototype.foo.key, 'foo');
	obj = new db.Dwa();
	a(getPrototypeOf(obj.get('foo')), db.Dwa.prototype.foo);

	db = new Database();
	db.Object.extend('ProcessingStep', {
		isApplicable: { type: db.Boolean, value: true },
		isElse: { type: db.Boolean, value: true },
		isSentBack: { type: db.Boolean, value: function (_observe) {
			return _observe(this.master._isSubmitted);
		} }
	});
	db._getterCounter = 0;
	db.Object.extend('BusinessProcess', {
		processingSteps: {
			type: db.Object,
			nested: true
		},
		isSubmitted: {
			type: db.Boolean,
			value: function (_observe) {
				++this.database._getterCounter;
				return _observe(this.processingSteps.applicable).every(function (ps) {
					return _observe(ps._isElse);
				});
			}
		}
	});
	db.BusinessProcess.prototype.processingSteps.defineProperties({
		map: {
			type: db.Object,
			nested: true
		},
		applicable: {
			type: db.ProcessingStep,
			multiple: true,
			value: function (_observe) {
				var result = [];
				this.map.forEach(function (ps) {
					if (_observe(ps._isApplicable)) result.push(ps);
				});
				return result;
			}
		}
	});
	db.BusinessProcess.prototype.processingSteps.map.defineProperties({
		foo: {
			nested: true,
			type: db.ProcessingStep
		},
		bar: {
			nested: true,
			type: db.ProcessingStep
		}
	});
	db.ProcessingStep.instances.filterByKey('isSentBack');
	obj = new db.BusinessProcess();
	a(obj.getObservable('isSubmitted').value, true);
	a(db._getterCounter, 1);
};
