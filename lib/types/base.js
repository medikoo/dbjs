'use strict';

var isFunction           = require('es5-ext/lib/Function/is-function')
  , d                    = require('es5-ext/lib/Object/descriptor')
  , extendProps          = require('es5-ext/lib/Object/extend-properties')
  , forEach              = require('es5-ext/lib/Object/for-each')
  , RelTransport         = require('./_internals/rel-transport')
  , validateCompleteness = require('./_internals/validate-completeness')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/

  , Relation, define, Base, ObjectType, abstractLock;

module.exports = Base = defineProperties(function Self(value) {
	return Self.validate(value);
}, {
	__id: d('c', 'base'),
	create: d('c', function (name, constructor, nsProps, objProps) {
		var isAbstract = abstractLock;
		abstractLock = false;

		if (!nameRe.test(name)) {
			throw new Error(name + "is not valid namespace name");
		}
		if (ObjectType.hasOwnProperty(name)) throw new Error("Name already taken");

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

		defineProperty(this, name, d('c', constructor));
		defineProperty(ObjectType, name, d('c', constructor));
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

// Temporary ObjectType (we needed until it's actually defined)
ObjectType = defineProperty({}, 'base', d('c', Base));

// Define relation type
Relation = require('./relation');

define = require('./_internals/define');

// As we have relation defined, we need to define `set` methods:
define(Base, 'set', function (name, value) {
	if (!nameRe.test(name)) {
		throw new Error("'" + name + "' is not valid property name");
	}

	if ((name in this) && (('_$' + name) in this)) { //jslint: skip
		// Defined value, set directly
		return (this[name] = value);
	}
	return define(this, name, value);
});
define(Base, 'setMany', function (props) {
	forEach(props, function (value, name) { this.set(name, value); }, this);
});
define(Base.prototype, 'set', Base.set);
define(Base.prototype, 'setMany', Base.setMany);

// As we have `set` methods, we can *set* basic properties
Base.set('validate');
Base.set('normalize');
Base.set('async', false);
Relation.prototype.set('required', false);

// Configure basic properties
Base._set.required = Base._setMany.required = Base.prototype._set.required =
	Base.prototype._setMany.required = Base._validate.required =
	Base._normalize.required = Base._async.required =
	Relation.prototype._required.required = true;

// Function type
Base._validate.ns = Base._normalize.ns = require('./function');

// Boolean type
Relation.prototype._required.ns = Base._async.ns = require('./boolean');

// Object type
ObjectType = extendProps(require('./object'), ObjectType);
