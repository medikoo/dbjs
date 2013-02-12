'use strict';

var d                  = require('es5-ext/lib/Object/descriptor')
  , forEach            = require('es5-ext/lib/Object/for-each')
  , validateProperties = require('../utils/validate-properties')
  , proto              = require('./');

Object.defineProperties(proto, {
	setProperties: d(function (props) {
		var error = this.validateProperties(props);
		if (error) throw error;
		this.$setProperties(props);
	}),
	$setProperties: d(function (props) {
		forEach(props, function (value, name) { this.$set(name, value); }, this);
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

require('./own-property-name-set');
require('./property-name-set');
