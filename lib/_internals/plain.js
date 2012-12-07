'use strict';

var validFunction = require('es5-ext/lib/Function/valid-function')
  , d             = require('es5-ext/lib/Object/descriptor')
  , forEach       = require('es5-ext/lib/Object/for-each')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , nameRe        = require('./name-re')

  , push = Array.prototype.push
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf

  , define, Plain;

module.exports = Plain = defineProperties(function () {}, {
	create: d('c', function (constructor) {
		validFunction(constructor);
		constructor.__proto__ = this;
		constructor.prototype = create(this.prototype);
		defineProperty(constructor.prototype, 'constructor', d(constructor));
		return constructor;
	}),
	set: d('c', function (name, value) {
		var error = this.validateProperty(name, value);
		if (error) throw error;
		return define(this, String(name), value);
	}),
	$set: d('c', function (name, value) {
		return define(this, name, value);
	}),
	setProperties: d('c', function (props) {
		var error = this.validateProperties(props);
		if (error) throw error;
		return this.$setProperties(props);
	}),
	$setProperties: d('c', function (props) {
		forEach(props, function (value, name) { define(this, name, value); }, this);
		return props;
	}),
	validateProperty: d('c', function (name, value) {
		name = String(name);
		if (!nameRe.test(name) && !((name in this) && this['__' + name])) {
			return new Error("'" + name + "' is not valid name");
		}
		return define.validate(this, String(name), value);
	}),
	validateProperties: d('c', function (props) {
		var error, errors = this._validateMany_(props, this.validateProperty);
		if (!errors) return null;
		error = new TypeError("Invalid property values");
		error.errors = errors;
		return error;
	}),
	validatePropertyNew: d('c', function (name, value) {
		var relName;
		if (value === undefined) {
			if (!nameRe.test(name) && !((name in this) && this['__' + name])) {
				return new Error("'" + name + "' is not valid name");
			}
			if (this[relName = '__' + name] && this[relName].required &&
					(this[relName]._value == null)) {
				return new TypeError(value + " is not a value");
			}
			return null;
		}
		return this.validateProperty(name, value);
	}),
	validateUndefinedNew: d('c', function (props) {
		var prop, proto = this, done = {}, iterate, error, errors, propName;
		iterate = function (name) {
			if (done[name]) return;
			done[name] = true;
			if (!startsWith.call(name, '__') ||
					(props && props.hasOwnProperty(propName = name.slice(2)) &&
						(props[propName] != null))) {
				return;
			}
			prop = proto[name];
			if (prop.required && (prop._value == null)) {
				if (!errors) errors = [];
				errors.push(new TypeError("Missing value for '" + propName + "'"));
			}
		};
		while (proto !== Object.prototype) {
			getOwnPropertyNames(proto).forEach(iterate);
			proto = getPrototypeOf(proto);
		}
		if (!errors) return null;
		error = new TypeError("Missing properties");
		error.errors = errors;
		return error;
	}),
	validatePropertiesNew: d('c', function (props) {
		var error, errors = this._validateMany_(props, this.validatePropertyNew);
		if (!errors) return null;
		error = new TypeError("Invalid property values");
		error.errors = errors;
		return error;
	}),
	_validateMany_: d('c', function (props, validate) {
		var error, errors;
		forEach(props, function (value, name) {
			if ((error = validate.call(this, name, value))) {
				if (!errors) errors = [];
				errors.push(error);
			}
		}, this);
		return errors;
	}),
	combineErrors: d('c', function (error) {
		var combined;
		forEach(arguments, function (error) {
			if (!error) return;
			if (!combined) {
				combined = new Error();
				combined.errors = [];
			}
			push.apply(combined.errors, error.errors);
		});
		return combined;
	})
});
defineProperties(Plain.prototype, {
	set: d(Plain.set),
	$set: d(Plain.__set),
	validateProperty: d(Plain.validateProperty),
	setProperties: d(Plain.setProperties),
	$setProperties: d(Plain.$setProperties),
	validateProperties: d(Plain.validateProperties),
	validatePropertyNew: d(Plain.validatePropertyNew),
	_validateMany_: d(Plain._validateMany_),
	validatePropertiesNew: d(Plain.validatePropertiesNew),
	validateUndefinedNew: d(Plain.validateUndefinedNew)
});

// Definition logic
define = require('./define');
