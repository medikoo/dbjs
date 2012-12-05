'use strict';

var i                = require('es5-ext/lib/Function/i')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , d                = require('es5-ext/lib/Object/descriptor')
  , nameRe           = require('../_internals/name-re')
  , serialize        = require('../_internals/serialize')
  , validateFunction = require('../_internals/validate-function')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , base, Plain, Relation, RelTransport, define, abstractLock;

module.exports = base = function (value) { return value; };
Plain = require('../_internals/plain');
Plain.create(base);
Relation = require('../_internals/relation');
define = require('../_internals/define-basic');
RelTransport = require('../_internals/rel-transport');

defineProperties(base, {
	_id_: d('c', 'base'),
	create: d('c', function (name, constructor, nsProps, objProps) {
		var error, isAbstract = abstractLock;
		abstractLock = false;

		if (!nameRe.test(name)) throw new Error(name + " is not a valid name");
		if (base.hasOwnProperty(name)) throw new Error(name + " is already taken");

		// Normalize arguments
		if (!isFunction(constructor)) {
			objProps = nsProps;
			nsProps = constructor;
			constructor = null;
		}

		// Validate
		error = this.combineErrors(nsProps && this.validatePropertiesNew(nsProps),
			!isAbstract && this.validateUndefinedNew(nsProps),
			objProps && this.prototype.validatePropertiesNew(objProps));

		if (error) {
			error.message = "Invalid properties";
			throw error;
		}

		constructor = Plain.create.call(this, constructor);
		defineProperties(constructor, { _id_: d(name) });
		defineProperties(constructor.prototype, {
			_id_: d(name + '#'),
			ns: d('c', constructor)
		});

		if (nsProps) constructor.$setProperties(nsProps);
		if (objProps) constructor.prototype.$setProperties(objProps);
		defineProperty(base, name, d('c', constructor));

		return constructor;
	}),
	abstract: d('c', function (name, constructor, nsProps, objProps) {
		abstractLock = true;
		try {
			return this.create.apply(this, arguments);
		} finally {
			abstractLock = false;
		}
	}),
	rel: d('c', function (data) {
		if (data == null) return this;
		return new RelTransport(this, data);
	}),
	required: d.gs('c', function () {
		return new RelTransport(this, { required: true });
	}),

	coerce: d('c', function (value) { return value; }),
	_serialize_: d('c', serialize)
});

// Following (plus constructor) should be carefully implemented by
// each namespace (ignore underscored functions)

// NS.is(value)
// Whether value represents value from given namespace
define(base, 'is', function () { return true; });
defineProperties(base.__is, {
	_normalize: d(i),
	validate: d(validateFunction)
});

// NS.normalize(value)
// Tries to normalize value into an instance, but without creating new
// *database object* (that derives from base.Object)
// If it's not possible returns null
define(base, 'normalize', function (value) { return value; });
defineProperties(base.__normalize, {
	_normalize: d(i),
	validate: d(validateFunction)
});

// NS.validate(data)
// Tells whether it is ok to obtain an instance out of given data.
// Data may already be an instance.
// On ok returns undefined, if not ok returns error object that
// describes the issue(s)
define(base, 'validate', function (value) { return null; });
defineProperties(base.__validate, {
	_normalize: d(i),
	validate: d(validateFunction)
});

defineProperty(base, 'base', d('c', base));
defineProperty(base.prototype, '_id_', d('c', 'base#'));
define(base.prototype, 'toString', Object.prototype.toString);
defineProperties(base.prototype.__toString, {
	_normalize: d(i),
	validate: d(validateFunction)
});

Relation.prototype.__ns._value = base;
