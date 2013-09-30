'use strict';

var d            = require('d/d')
  , proto        = require('./')
  , RelTransport = require('../_relation/transport')

  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/
  , isValidNsRef, validate;

isValidNsRef = function (name) { return (name[0] !== name[0].toLowerCase()); };

validate = function (name, value, validate) {
	name = String(name);
	if (!nameRe.test(name) && !((name in this) && this['__' + name])) {
		return new Error("'" + name + "' is not valid name");
	}
	if (value instanceof RelTransport) return value.validate(this, name);
	if (value && (typeof value === 'function') &&
			(value._type_ === 'namespace') && !isValidNsRef(name)) {
		return null;
	}
	return this.get(name)[validate](value);
};

Object.defineProperties(proto, {
	set: d(function (name, value) {
		var error = this.validateProperty(name, value);
		if (error) throw error;
		return this.$set(String(name), value);
	}),
	$set: d(function (name, value) {
		var rel;
		rel = this.get(name);
		if (value instanceof RelTransport) {
			value.apply(rel);
		} else if ((typeof value === 'function') &&
				(value._type_ === 'namespace') && !isValidNsRef(name)) {
			rel._ns._signal_(value);
		} else {
			rel.$setValue(value);
		}
		return rel;
	}),
	validateProperty: d(function (name, value) {
		return validate.call(this, name, value, 'validate');
	}),
	validateCreateProperty: d(function (name, value) {
		return validate.call(this, name, value, 'validateCreate');
	})
});

require('./properties');
