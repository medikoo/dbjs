'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , nameRe       = require('./name-re')
  , RelTransport = require('./rel-transport')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , root, Plain;

module.exports = root = function (value) { return value; };
Plain = require('./plain');
Plain.create(root);

defineProperties(root, {
	__id: d('c', 'root'),
	create: d('c', function (name, constructor, nsProps, objProps) {
		if (!nameRe.test(name)) {
			throw new Error(name + " is not a valid namespace name");
		}
		if (root.hasOwnProperty(name)) throw new Error(name + " is already taken");

		constructor = Plain.create.call(this, constructor, nsProps, objProps);
		defineProperty(root, name, d('c', constructor));
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
	})
});

// Following (plus constructor) should be carefully implemented by
// each namespace

// NS.is(value)
// Whether value represents value from given namespace
root.set('is', function () { return true; });

// NS.normalize(value)
// Tries to normalize value into an instance, but without creating new
// *database object* (that derives from root.Object)
// If it's not possible returns null
root.set('normalize', function (value) { return value; });

// NS.validate(data)
// Tells whether it is ok to obtain an instance out of given data.
// Data may already be an instance.
// On ok returns undefined, if not ok returns error object that
// describes the issue(s)
root.set('validate', function () { });

root._is.required = root._normalize.required = root._validate.required = true;
