'use strict';

var isFunction   = require('es5-ext/lib/Function/is-function')
  , d            = require('es5-ext/lib/Object/descriptor')
  , forEach      = require('es5-ext/lib/Object/for-each')
  , startsWith   = require('es5-ext/lib/String/prototype/starts-with')
  , nameRe       = require('./name-re')
  , RelTransport = require('./rel-transport')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf

  , Relation, RelSetItem, define, abstractLock, Plain, propsValidator;

propsValidator = function (obj, props, cb, errors, prefix) {
	var error;
	forEach(props, function (value, name) {
		if ((error = cb.call(obj, name, value))) {
			if (!errors) errors = {};
			errors[(prefix || '') + name] = error;
		}
	});
	return errors;
};

module.exports = Plain = defineProperties(function () {}, {
	create: d('c', function (constructor, nsProps, objProps) {
		var error, isAbstract = abstractLock;
		abstractLock = false;

		// Normalize arguments
		if (!isFunction(constructor)) {
			objProps = nsProps;
			nsProps = constructor;
			constructor = null;
		}

		// Validate
		if (nsProps) {
			error = this.validatePropertiesNew(nsProps);
			if (!isAbstract) {
				error = this.validateUndefinedNew(nsProps, error && error.subErrors);
			}
		}
		if (objProps) {
			error = this.prototype.validatePropertiesNew(objProps,
				error && error.subErrors, 'prototype.');
		}
		if (error) throw error;

		// Construct & Return
		if (!constructor) constructor = eval('(' + String(this) + ')');
		constructor.__proto__ = this;
		constructor.prototype = create(this.prototype);
		defineProperty(constructor.prototype, 'constructor', d(constructor));

		if (nsProps) {
			forEach(nsProps, function (value, name) {
				constructor.set(name, value);
			});
		}
		if (objProps) {
			forEach(objProps, function (value, name) {
				this.set(name, value);
			}, constructor.prototype);
		}
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
	set: d('c', function (name, value) {
		if (!nameRe.test(name)) {
			throw new Error("'" + name + "' is not valid property name");
		}

		if ((name in this) && (('_$' + name) in this)) { //jslint: skip
			// Defined value, set directly
			return (this[name] = value);
		}
		return define(this, name, value);
	}),
	setMany: d('c', function (props) {
		var error = this.validateProperties(props);
		if (error) throw error;
		forEach(props, function (value, name) { this.set(name, value); }, this);
	}),
	validateProperty: d('c', function (name, value) {
		var relName;
		if (!nameRe.test(name)) {
			return new Error("'" + name + "' is not valid property name");
		}

		if (value instanceof RelTransport) {
			return value.validate();
		} else if ((name in this) && //jslint: skip
				((relName = ('_$' + name)) in this)) {
			// Defined value
			if (value === undefined) {
				if (this.hasOwnProperty(relName)) return this[relName].validate(value);
				if (this[relName].required && (this[relName]._value == null)) {
					return new TypeError(value + " is not a value");
				}
			}
			return this[relName].validate(value);
		}
	}),
	validateProperties: d('c', function (props, errors) {
		var error;
		errors = propsValidator(this, props, this.validateProperty, errors);
		if (errors) {
			error = new TypeError("Invalid properties data");
			error.subErrors = errors;
			return error;
		}
	}),
	validateUndefinedNew: d('c', function (props, errors) {
		var prop, proto = this, done = {}, iterate, error, propName;
		iterate = function (name) {
			if (done[name]) return;
			done[name] = true;
			if (!startsWith.call(name, '_$') ||
					(props && props.hasOwnProperty(propName = name.slice(2)) &&
						(props[propName] != null))) {
				return;
			}
			prop = proto[name];
			if (!prop || !prop._$required) return;
			if (prop._$required._value && (prop._value == null)) {
				if (!errors) errors = {};
				errors[propName] =
					new TypeError("Missing value for '" + propName + "'");
			}
		};
		while (proto !== Object.prototype) {
			getOwnPropertyNames(proto).forEach(iterate);
			proto = getPrototypeOf(proto);
		}
		if (errors) {
			error = new TypeError("Invalid properties data");
			error.subErrors = errors;
			return error;
		}
	}),
	validatePropertiesNew: d('c', function (props, errors, prefix) {
		var error;
		errors = propsValidator(this, props, function (name, value) {
			var relName;
			if (value === undefined) {
				if (!nameRe.test(name)) {
					return new Error("'" + name + "' is not valid property name");
				}
				if (this[relName = '_$' + name] && this[relName].required &&
						(this[relName]._value == null)) {
					return new TypeError(value + " is not a value");
				}
			} else {
				return this.validateProperty(name, value);
			}
		}, errors, prefix);
		if (errors) {
			error = new TypeError("Invalid properties data");
			error.subErrors = errors;
			return error;
		}
	})
});
defineProperties(Plain.prototype, {
	set: d('c', Plain.set),
	validateProperty: d('c', Plain.validateProperty),
	setMany: d('c', Plain.setMany),
	validateProperties: d('c', Plain.validateProperties),
	validatePropertiesNew: d('c', Plain.validatePropertiesNew),
	validateUndefinedNew: d('c', Plain.validateUndefinedNew)
});

// Define relation
Relation = require('./relation');

define = require('./define');

define(Relation.prototype, 'required');
define(Relation.prototype, 'multiple');
Relation.prototype._required.value = false;
Relation.prototype._required.required = true;
Relation.prototype._multiple.value = false;
Relation.prototype._multiple.required = true;
RelSetItem = require('./rel-set-item');
define(RelSetItem.prototype, 'order');
