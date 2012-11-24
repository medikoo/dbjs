'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , nameRe       = require('../_internals/name-re')
  , getFnGetSet  = require('../_internals/get-function-get-set')
  , RelTransport = require('../_internals/rel-transport')
  , serialize    = require('../_internals/serialize')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , base, Plain, Relation;

module.exports = base = function (value) { return value; };
Plain = require('../_internals/plain');
Plain.create(base);
Relation = require('../_internals/relation');

defineProperties(base, {
	__id: d('c', 'base'),
	create: d('c', function (name, constructor, nsProps, objProps) {
		if (!nameRe.test(name)) throw new Error(name + " is not a valid name");
		if (base.hasOwnProperty(name)) throw new Error(name + " is already taken");

		constructor = Plain.create.call(this, constructor, nsProps, objProps);
		defineProperty(base, name, d('c', constructor));
		defineProperties(constructor.prototype, {
			__id: d(name + '#'),
			ns: d('c', constructor)
		});
		return defineProperties(constructor, {
			__id: d(name)
		});
	}),
	rel: d('c', function (data) {
		if (data == null) return this;
		return new RelTransport(this, data);
	}),
	required: d.gs('c', function () {
		return new RelTransport(this, { required: true });
	}),

	coerce: d('c', function (value) { return value; }),
	__serialize: d('c', serialize),

	// Following (plus constructor) should be carefully implemented by
	// each namespace (ignore underscored functions)

	// NS.is(value)
	// Whether value represents value from given namespace
	is: getFnGetSet('is'),
	_is: d('c', function () { return true; }),

	// NS.normalize(value)
	// Tries to normalize value into an instance, but without creating new
	// *database object* (that derives from base.Object)
	// If it's not possible returns null
	normalize: getFnGetSet('normalize'),
	_normalize: d('c', function (value) { return value; }),

	// NS.validate(data)
	// Tells whether it is ok to obtain an instance out of given data.
	// Data may already be an instance.
	// On ok returns undefined, if not ok returns error object that
	// describes the issue(s)
	validate: getFnGetSet('validate'),
	_validate: d('c', function () {})
});
defineProperty(base, 'base', d('c', base));
defineProperty(base.prototype, '__id', d('c', 'base#'));
defineProperty(Relation.prototype, '_ns', d('c', base));
