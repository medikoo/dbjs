'use strict';

var d            = require('es5-ext/lib/Object/descriptor')
  , Proto        = require('./')
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
	return this._getRel_(name)[validate](value);
};

// Constructor
Object.defineProperties(Proto, {
	set: d('c', function (name, value) {
		var error = this.validateProperty(name, value);
		if (error) throw error;
		return this.$set(String(name), value);
	}),
	$set: d('c', function (name, value) {
		var rel;
		rel = this._getRel_(name);
		if (value instanceof RelTransport) {
			value.apply(rel);
		} else if ((typeof value === 'function') &&
				(value._type_ === 'namespace') && !isValidNsRef(name)) {
			rel._ns.$$setValue(value);
			rel._ns._signal_(value);
		} else {
			rel.$setValue(value);
		}
		return value;
	}),
	validateProperty: d('c', function (name, value) {
		return validate.call(this, name, value, 'validate');
	}),
	validateCreateProperty: d('c', function (name, value) {
		return validate.call(this, name, value, 'validateCreate');
	})
});

// Prototype
Object.defineProperties(Proto.prototype, {
	set: d(Proto.set),
	$set: d(Proto.$set),
	validateProperty: d(Proto.validateProperty),
	validateCreateProperty: d(Proto.validateCreateProperty)
});

require('./properties');
