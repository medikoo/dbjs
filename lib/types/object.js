'use strict';

var isFunction  = require('es5-ext/lib/Function/is-function')
  , d           = require('es5-ext/lib/Object/descriptor')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , uuid        = require('time-uuid')
  , nameRe      = require('../_internals/name-re')
  , getFnGetSet = require('../_internals/get-function-get-set')
  , root        = require('./root')

  , slice = Array.prototype.slice
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , ObjectType, Constructor;

module.exports = ObjectType = root.create('Object', function self(value) {
	var error;
	if (self.is(value)) return value;
	if ((error = self.verify.apply(self, arguments))) throw error;
	return self.__construct(arguments);
}, {
	is: function (value) {
		var id = value && value.__id;
		return (id && this.propertyIsEnumerable(id) && (this[id] === value)) ||
			false;
	},
	validate: function (value) {
		if (this.is(value)) return;
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
		constructor = root.create.call(this, name, nsProps, objProps);
		if (construct) constructor.construct = construct;
		return constructor;
	}),
	newNamed: d('c', function (name, value) {
		var error, args;
		if (!nameRe.test(name)) throw new Error(name + " is invalid name");
		if (root.hasOwnProperty(name)) throw new Error(name + " is already taken");
		args = slice.call(arguments, 1);
		if ((error = this.verify.apply(this, args))) throw error;
		return this.__construct(args, name);
	}),
	__construct: d('c', function (args, name) {
		var id, proto, obj;
		id = name || uuid();
		Constructor.prototype = this.prototype;
		obj = defineProperties(new Constructor(), {
			__id:      d('c', id)
		});
		this.construct.apply(obj, args);
		this[id] = obj;
		proto = this;
		while (proto !== ObjectType) {
			proto = getPrototypeOf(proto);
			proto[id] = obj;
		}
		return obj;
	}),
	construct: getFnGetSet('construct'),
	_construct: d('c', function (props) {
		// Called in instance context
		if (props) {
			forEach(props, function (value, name) { this.set(name, value); }, this);
		}
	}),
	verify: getFnGetSet('verify'),
	_verify: d('c', function (props) {
		var error, proto;
		proto = this.prototype;
		if (props) (error = proto.validatePropertiesNew(props));
		return proto.validateUndefinedNew(props, error && error.subErrors);
	})
});
