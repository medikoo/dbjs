'use strict';

var d                  = require('es5-ext/lib/Object/descriptor')
  , forEach            = require('es5-ext/lib/Object/for-each')
  , startsWith         = require('es5-ext/lib/String/prototype/starts-with')
  , validateProperties = require('../utils/validate-properties')
  , Proto              = require('./')

  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf;

Object.defineProperties(Proto, {
	getPropertyNames: d('c', function () {
		var base, done = {}, names = [], iterate, proto;
		iterate = function (name) {
			var rel;
			if (done[name]) return;
			done[name] = true;
			if (startsWith.call(name, '__')) {
				if ((name === '__value') || !(rel = this[name]) ||
						(rel !== this[name.slice(1)])) {
					return;
				}
			} else {
				return;
			}
			if (!rel.required && (rel.ns._id_ === 'Base') && (rel._value == null)) {
				return;
			}
			names.push(name.slice(2));
		};
		proto = this;
		base = typeof this === 'function' ? Proto : Proto.prototype;
		while (proto && (proto !== base)) {
			getOwnPropertyNames(proto).forEach(iterate, proto);
			proto = getPrototypeOf(proto);
		}
		return names;
	}),
	setProperties: d('c', function (props) {
		var error = this.validateProperties(props);
		if (error) throw error;
		return this.$setProperties(props);
	}),
	$setProperties: d('c', function (props) {
		forEach(props, function (value, name) { this.$set(name, value); }, this);
		return props;
	}),
	validateProperties: d('c', function (props) {
		return validateProperties(this, props, this.validateProperty);
	}),
	validateCreateProperties: d('c', function (props) {
		return validateProperties(this, props, this.validateCreateProperty);
	}),
	validateCreateUndefined: d('c', function (props) {
		var error, errors;
		this.getPropertyNames().forEach(function (name) {
			var rel = this['_' + name];
			if (rel.required && (rel._value == null) &&
					(!props || (props[name] == null))) {
				if (!errors) errors = [];
				errors.push(new TypeError("Missing value for '" + name + "'"));
			}
		}, this);
		if (!errors) return null;
		error = new TypeError("Missing properties");
		error.errors = errors;
		return error;
	})
});

Object.defineProperties(Proto.prototype, {
	getPropertyNames: d(Proto.getPropertyNames),
	setProperties: d(Proto.setProperties),
	$setProperties: d(Proto.$setProperties),
	validateProperties: d(Proto.validateProperties),
	validateCreateProperties: d(Proto.validateCreateProperties),
	validateCreateUndefined: d(Proto.validateCreateUndefined)
});
