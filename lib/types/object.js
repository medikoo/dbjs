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

module.exports = ObjectType = Base.create('Object', function (value) {
	var error;
	if (this.is(value)) return value;
	if ((error = this.verify.apply(this, arguments))) throw error;
	return this.$construct.apply(this, arguments);
}, {
	is: function (value) {
		var id = value && value._id_;
		return (id && this.propertyIsEnumerable(id) && (this[id] === value)) ||
			false;
	},
	$construct: function (value) {
		var obj = this.$$construct(uuid());
		obj.$construct.apply(obj, arguments);
		return obj;
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
	create: d('c', function (name, $construct, objProps, nsProps) {
		if (!isFunction($construct)) {
			nsProps = objProps;
			objProps = $construct;
		} else if (!objProps) {
			objProps = { $construct: $construct };
		} else {
			objProps.$construct = $construct;
		}
		return Base.create.call(this, name, nsProps, objProps);
	}),
	$$construct: d('c', function (id) {
		var proto, obj;
		Constructor.prototype = this.prototype;
		obj = defineProperties(new Constructor(), {
			_id_: d('c', id)
		});
		this[id] = obj;
		proto = this;
		while (proto !== ObjectType) {
			proto = getPrototypeOf(proto);
			proto[id] = obj;
		}
		return obj;
	}),
	newNamed: d('c', function (name, value) {
		var error, args, obj;
		if (!nameRe.test(name)) throw new Error(name + " is invalid name");
		if (name in Base) throw new Error(name + " is already taken");
		args = slice.call(arguments, 1);
		if ((error = this.verify.apply(this, args))) throw error;
		obj = this.$$construct(name);
		obj.$construct.apply(obj, args);
		return obj;
	}),
	coerce: d('c', ObjectType.normalize),
	_serialize_: d('c', function (value) { return '7' + value._id_; })
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

define(ObjectType.prototype, '$construct', function (props) {
	if (props) this.$setProperties(props);
});
defineProperties(ObjectType.prototype.__$construct, {
	_normalize: d(i),
	validate: d(validateFunction)
});
