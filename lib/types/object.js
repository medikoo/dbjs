'use strict';

var i                = require('es5-ext/lib/Function/i')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , d                = require('es5-ext/lib/Object/descriptor')
  , uuid             = require('time-uuid')
  , validateFunction = require('../_internals/validate-function')
  , Base             = require('./base')
  , define           = require('../_internals/define-basic')

  , slice = Array.prototype.slice
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , nameRe = /^[a-z][0-9a-zA-Z]*$/

  , ObjectType, Constructor;

module.exports = ObjectType = Base.create('Object', function self(value) {
	var error;
	if (self.is(value)) return value;
	if ((error = self.verify.apply(self, arguments))) throw error;
	return self._construct_(arguments);
}, {
	is: function (value) {
		var id = value && value._id_;
		return (id && this.propertyIsEnumerable(id) && (this[id] === value)) ||
			false;
	},
	validate: function (value) {
		if (this.is(value)) return null;
		return this.verify.apply(this, arguments);
	},
	normalize: function (value) {
		return this.is(value) ? value : null;
	}
});

Constructor = function () {};
defineProperties(ObjectType, {
	create: d('c', function (name, constructor, objProps, nsProps) {
		var construct;
		if (!isFunction(constructor)) {
			nsProps = objProps;
			objProps = constructor;
		} else {
			construct = constructor;
		}
		constructor = Base.create.call(this, name, nsProps, objProps);
		if (construct) constructor.construct = construct;
		return constructor;
	}),
	newNamed: d('c', function (name, value) {
		var error, args;
		if (!nameRe.test(name)) throw new Error(name + " is invalid name");
		if (name in Base) throw new Error(name + " is already taken");
		args = slice.call(arguments, 1);
		if ((error = this.verify.apply(this, args))) throw error;
		return this._construct_(args, name);
	}),
	coerce: d('c', ObjectType.normalize),
	_serialize_: d('c', function (value) { return '7' + value._id_; }),
	_construct_: d('c', function (args, name) {
		var id, proto, obj;
		id = name || uuid();
		Constructor.prototype = this.prototype;
		obj = defineProperties(new Constructor(), {
			_id_: d('c', id)
		});
		this.construct.apply(obj, args);
		this[id] = obj;
		proto = this;
		while (proto !== ObjectType) {
			proto = getPrototypeOf(proto);
			proto[id] = obj;
		}
		return obj;
	})
});

define(ObjectType, 'construct', function (props) {
	// Called in instance context
	if (props) this.$setProperties(props);
});
defineProperties(ObjectType.__construct, {
	_normalize: d(i),
	validate: d(validateFunction)
});

define(ObjectType, 'verify', function (props) {
	var error, proto = this.prototype;
	error = this.combineErrors(props && proto.validatePropertiesNew(props),
		proto.validateUndefinedNew(props));
	if (error) {
		error.message = "Invalid properties";
		return error;
	}
	return null;
});
defineProperties(ObjectType.__verify, {
	_normalize: d(i),
	validate: d(validateFunction)
});
