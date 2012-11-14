'use strict';

var isFunction           = require('es5-ext/lib/Function/is-function')
  , d                    = require('es5-ext/lib/Object/descriptor')
  , forEach              = require('es5-ext/lib/Object/for-each')
  , RelTransport         = require('./_internals/rel-transport')
  , validateCompleteness = require('./_internals/validate-completeness')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/

  , Relation, define, base, abstractLock;

module.exports = base = defineProperties(function Self(value) {
	return Self.validate(value);
}, {
	__id: d('c', 'base'),
	create: d('c', function (name, constructor, nsProps, objProps) {
		var isAbstract = abstractLock;
		abstractLock = false;

		if (!nameRe.test(name)) {
			throw new Error(name + "is not valid namespace name");
		}
		if (base.hasOwnProperty(name)) throw new Error(name + " is already taken");

		if (!isFunction(constructor)) {
			objProps = nsProps;
			nsProps = constructor;
			constructor = eval('(' + String(this) + ')');
		}
		constructor.__proto__ = this;
		constructor.prototype = create(this.prototype);
		defineProperty(constructor.prototype, 'constructor', d(constructor));

		defineProperties(constructor, {
			__id: d(name)
		});

		if (nsProps) constructor.setMany(nsProps, '');
		if (!isAbstract) validateCompleteness(constructor);
		if (objProps) constructor.prototype.setMany(objProps, 'e');

		defineProperty(base, name, d('c', constructor));
		return constructor;
	}),
	abstract: d('c', function (name, constructor, nsProps, objProps) {
		abstractLock = true;
		return this.create.apply(this, arguments);
	}),
	rel: d('c', function (data) {
		if (data == null) return this;
		return new RelTransport(this, data);
	})
});

// Define relation type
Relation = require('./relation');

define = require('./_internals/define');

define(Relation.prototype, 'required');
define(Relation.prototype, 'multiple');
define(Relation.prototype, 'validate');
Relation.prototype._required.value = false;
Relation.prototype._required.required = true;
Relation.prototype._multiple.value = false;
Relation.prototype._multiple.required = true;

// as we have relation defined, we need to define `set` methods:
define(base, 'set', function (name, value) {
	if (!nameRe.test(name)) {
		throw new Error("'" + name + "' is not valid property name");
	}

	if ((name in this) && (('_$' + name) in this)) { //jslint: skip
		// Defined value, set directly
		return (this[name] = value);
	}
	return define(this, name, value);
});
define(base, 'setMany', function (props) {
	forEach(props, function (value, name) { this.set(name, value); }, this);
});
define(base.prototype, 'set', base.set);
define(base.prototype, 'setMany', base.setMany);

// As we have `set` methods, we can *set* basic properties
base.set('validate');
base.set('normalize');

// Configure basic properties
base._validate.required = base._normalize.required = true;

// Function type
base._validate.ns = base._normalize.ns =
	Relation.prototype._validate.ns = require('./function');

// Boolean type
Relation.prototype._required.ns = require('./boolean');
