'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , forEach      = require('es5-ext/lib/Object/for-each')
  , startsWith   = require('es5-ext/lib/String/prototype/starts-with')
  , nameRe       = require('./name-re')
  , isNamespace  = require('./is-namespace')
  , RelTransport = require('./rel-transport')

  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf

  , Relation, define, Plain, propsValidator;

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
	create: d('c', function (constructor) {
		if (!constructor) constructor = eval('(' + String(this) + ')');
		constructor.__proto__ = this;
		constructor.prototype = create(this.prototype);
		defineProperty(constructor.prototype, 'constructor', d(constructor));
		return constructor;
	}),
	set: d('c', function (name, value) {
		var error = this.validateProperty(name, value);
		if (error) throw error;
		return this.__set(name, value);
	}),
	__set: d('c', function (name, value) {
		if (name in this) {
			if (this['_$' + name]) {
				name = String(name);
				if (isNamespace(value) && (name[0] === name[0].toLowerCase())) {
					this['_' + name].ns = value;
				} else {
					this['_' + name].__setValue(value);
				}
			} else {
				this[name] = value;
			}
		} else {
			define(this, name, value);
		}
		return value;
	}),
	setMany: d('c', function (props) {
		var error = this.validateProperties(props);
		if (error) throw error;
		forEach(props, function (value, name) { this.__set(name, value); }, this);
	}),
	validateProperty: d('c', function (name, value) {
		if (!nameRe.test(name)) {
			return new Error("'" + name + "' is not valid name");
		}
		if (value instanceof RelTransport) {
			return value.validate(this['_$' + name], this);
		} else {
			name = String(name);
			if (isNamespace(value) && (name[0] === name[0].toLowerCase())) return;
			if ((name in this) && //jslint: skip
					(('_$' + name) in this)) {
				// Defined value
				return this['_' + name].validate(value);
			}
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
	validatePropertyNew: d('c', function (name, value) {
		var relName;
		if (value === undefined) {
			if (!nameRe.test(name)) {
				return new Error("'" + name + "' is not valid name");
			}
			if (this[relName = '_$' + name] && this[relName]._required &&
					(this[relName]._value == null)) {
				return new TypeError(value + " is not a value");
			}
		} else {
			return this.validateProperty(name, value);
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
			if (prop._required && (prop._value == null)) {
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
		errors = propsValidator(this, props, this.validatePropertyNew, errors);
		if (errors) {
			error = new TypeError("Invalid properties data");
			error.subErrors = errors;
			return error;
		}
	})
});
defineProperties(Plain.prototype, {
	set: d(Plain.set),
	__set: d(Plain.__set),
	validateProperty: d(Plain.validateProperty),
	setMany: d(Plain.setMany),
	validateProperties: d(Plain.validateProperties),
	validatePropertyNew: d(Plain.validatePropertyNew),
	validatePropertiesNew: d(Plain.validatePropertiesNew),
	validateUndefinedNew: d(Plain.validateUndefinedNew)
});

// Define relation
Relation = require('./relation');
define = require('./define');
