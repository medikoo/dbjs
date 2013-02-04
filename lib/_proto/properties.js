'use strict';

var d                  = require('es5-ext/lib/Object/descriptor')
  , forEach            = require('es5-ext/lib/Object/for-each')
  , startsWith         = require('es5-ext/lib/String/prototype/starts-with')
  , validateProperties = require('../utils/validate-properties')
  , proto              = require('./')

  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf;

var metaNames = { __$construct: true, __validateConstruction: true,
	__toString: true };

Object.defineProperties(proto, {
	getPropertyNames: d(function (tag) {
		var done = {}, names = [], iterate, current;
		if (tag != null) tag = String(tag);
		iterate = function (name) {
			var rel;
			if (done.hasOwnProperty(name)) return;
			done[name] = true;
			if (!startsWith.call(name, '__')) return;
			if (metaNames.hasOwnProperty(name)) return;
			if ((name === '__value') || !(rel = this[name]) ||
					(rel._type_ !== 'relation')) {
				return;
			}
			if (!rel.__required.__value && (rel.__ns.__value._id_ === 'Base') &&
					(rel._value == null)) {
				return;
			}
			if (rel._value && (typeof rel._value === 'function') &&
					rel._value.hasOwnProperty('_overridenValue_')) {
				return;
			}
			if ((tag == null) || rel.tags.has(tag)) names.push(name.slice(2));
		};
		current = this;
		while (current && (current !== proto)) {
			getOwnPropertyNames(current).forEach(iterate, current);
			current = getPrototypeOf(current);
		}
		return names;
	}),
	setProperties: d(function (props) {
		var error = this.validateProperties(props);
		if (error) throw error;
		return this.$setProperties(props);
	}),
	$setProperties: d(function (props) {
		forEach(props, function (value, name) { this.$set(name, value); }, this);
		return props;
	}),
	validateProperties: d(function (props) {
		return validateProperties(this, props, this.validateProperty);
	}),
	validateCreateProperties: d(function (props) {
		return validateProperties(this, props, this.validateCreateProperty);
	}),
	validateCreateUndefined: d(function (props) {
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
