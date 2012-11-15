'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , nameRe       = require('./name-re')
  , RelTransport = require('./rel-transport')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , root, Plain;

module.exports = root = function Self(value) { return Self.validate(value); };
Plain = require('./plain');
Plain.create(root);

defineProperties(root, {
	__id: d('c', 'root'),
	create: d('c', function (name, constructor, nsProps, objProps) {
		if (!nameRe.test(name)) {
			throw new Error(name + "is not valid namespace name");
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
	})
});
root.set('validate');
root.set('normalize');
root._validate.required = root._normalize.required = true;
