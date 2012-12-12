
'use strict';

var i                = require('es5-ext/lib/Function/i')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , d                = require('es5-ext/lib/Object/descriptor')
  , uuid             = require('time-uuid')
  , Plain            = require('../_internals/plain')
  , validateFunction = require('../_internals/validate-function')
  , Base             = require('./base')
  , define           = require('../_internals/define-basic')
  , signal           = require('../_internals/signal')

  , slice = Array.prototype.slice
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , nameRe = /^[a-z][0-9a-zA-Z]*$/

  , ObjectType, signal, history;

module.exports = ObjectType = Base.$create('Object');
ObjectType._construct.$setValue(function (value) {
	var error;
	if (this.is(value)) return value;
	if ((error = this.verify.apply(this, arguments))) throw error;
	return this.$construct.apply(this, arguments);
});
ObjectType._is.$setValue(function (value) {
	var id = value && value._id_;
	return (id && this.propertyIsEnumerable(id) && (this[id] === value)) || false;
});
ObjectType._$construct.$setValue(function (value) {
	var obj = this.prototype.$create(uuid());
	signal(obj, this.prototype);
	obj.$construct.apply(obj, arguments);
	return obj;
});
ObjectType._validate.$setValue(function (value) {
	if (this.is(value)) return null;
	return this.verify.apply(this, arguments);
});
ObjectType._normalize.$setValue(function (value) {
	return this.is(value) ? value : null;
});

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
	newNamed: d('c', function (name, value) {
		var error, args, obj;
		if (!nameRe.test(name)) throw new Error(name + " is invalid name");
		if (name in Base) throw new Error(name + " is already taken");
		args = slice.call(arguments, 1);
		if ((error = this.verify.apply(this, args))) throw error;
		obj = this.prototype.$create(name);
		signal(obj, this.prototype);
		obj.$construct.apply(obj, args);
		return obj;
	}),
	coerce: d('c', ObjectType.normalize),
	_serialize_: d('c', function (value) { return '7' + value._id_; })
});

defineProperties(Base.prototype, {
	lastModified: d.gs(function () {
		var data = history[this._id_];
		return (data && data[0] && data[0]._stamp) || 0;
	}),
	$create: d((function () {
		var Constructor = function () {};
		return function (id) {
			var proto, obj;
			Constructor.prototype = this;
			obj = defineProperty(new Constructor(), '_id_', d('c', id));
			proto = this.ns;
			if (!proto) return obj;
			proto[id] = obj;
			while (proto !== ObjectType) {
				proto = getPrototypeOf(proto);
				if (proto === Base) break;
				proto[id] = obj;
			}
			this.ns.emit('add', obj);
			return obj;
		};
	}())),
	$proto: d(function (proto) {
		var ns, oldNs, id = this._id_, newNs;
		if (!proto) {
			proto = Plain.prototype;
			delete ObjectType[id];
		}
		if (getPrototypeOf(this) === proto) return;
		if ((ns = oldNs = this.ns)) {
			while (ns !== ObjectType) {
				delete ns[id];
				ns = getPrototypeOf(ns);
			}
		}
		this.__proto__ = proto;
		if (!proto._id_) {
			if (oldNs) oldNs.emit('remove', this);
			return;
		}
		newNs = proto = proto.ns;
		if (proto) {
			while (proto !== ObjectType) {
				proto[id] = this;
				proto = getPrototypeOf(proto);
				if (proto === Base) break;
			}
		}
		if (oldNs) oldNs.emit('delete', this);
		if (newNs) newNs.emit('add', this);
	})
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

signal = require('../_internals/signal');
history = signal.history;
