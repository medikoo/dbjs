'use strict';

var remove           = require('es5-ext/lib/Array/prototype/remove')
  , i                = require('es5-ext/lib/Function/i')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , d                = require('es5-ext/lib/Object/descriptor')
  , uuid             = require('time-uuid')
  , Plain            = require('../_internals/plain')
  , validateFunction = require('../_internals/validate-function')
  , Base             = require('./base')
  , define           = require('../_internals/define-basic')
  , reverse          = require('../_internals/rel-reverse')
  , protoDeep        = require('../_internals/proto-deep')

  , slice = Array.prototype.slice
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , getOwnPropertyNames = Object.getOwnPropertyNames

  , nameRe = /^[a-z][0-9a-zA-Z]*$/

  , ObjectType, signal, history;

module.exports = ObjectType = Base.$$create('Object');

ObjectType._verifyNS.$$setValue(function (construct, objProps, nsProps) {
	if (!isFunction(construct)) {
		nsProps = objProps;
		objProps = construct;
	} else if (!objProps) {
		objProps = { $construct: construct };
	} else {
		objProps.$construct = construct;
	}
	return Base.verifyNS.call(this, nsProps, objProps);
});
ObjectType._$construct.$$setValue(function (construct, objProps, nsProps) {
	if (!isFunction(construct)) {
		nsProps = objProps;
		objProps = construct;
	} else if (!objProps) {
		objProps = { $construct: construct };
	} else {
		objProps.$construct = construct;
	}
	return Base.$construct.call(this, nsProps, objProps);
});
ObjectType._is.$$setValue(function (value) {
	var id = value && value._id_;
	return (id && this.propertyIsEnumerable(id) && (this[id] === value)) || false;
});
ObjectType._validate.$$setValue(function (value) {
	if (this.is(value)) return null;
	return this.verify.apply(this, arguments);
});
ObjectType._normalize.$$setValue(function (value) {
	return this.is(value) ? value : null;
});
define(ObjectType, 'verify', function (props) {
	var error, proto = this.prototype;
	error = this.combineErrors(
		(props != null) && proto.validatePropertiesNew(props),
		proto.validateUndefinedNew(props)
	);
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
defineProperties(ObjectType, {
	newNamed: d('c', function (name, value) {
		var error, args, obj;
		if (!nameRe.test(name)) throw new Error(name + " is invalid name");
		if (name in Base) throw new Error(name + " is already taken");
		args = slice.call(arguments, 1);
		if ((error = this.verify.apply(this, args))) throw error;

		obj = this.prototype.$$create(name);
		signal(obj, this.prototype);
		obj.$construct.apply(obj, args);
		return obj;
	}),
	coerce: d('c', ObjectType.normalize),
	_serialize_: d('c', function (value) { return '7' + value._id_; })
});

ObjectType.prototype._$create.$$setValue(function (value) {
	var obj = this.$$create(uuid());
	signal(obj, this);
	obj.$construct.apply(obj, arguments);
	return obj;
});
defineProperties(Base.prototype, {
	$$create: d((function () {
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
			if (!this.hasOwnProperty('_children_')) {
				defineProperty(this, '_children_', d('', []));
			}
			this._children_.push(obj);
			this.emit('add', obj, id);
			return obj;
		};
	}())),
	_forEachReverse_: d(function (cb) {
		reverse.forEachObject(this, cb);
	})
});
define(ObjectType.prototype, '$construct', function (props) {
	if (props) this.$setProperties(props);
});
defineProperties(ObjectType.prototype.__$construct, {
	_normalize: d(i),
	validate: d(validateFunction)
});

defineProperty(Plain.prototype, '$$proto', d(function (proto) {
	var ns, old, id = this._id_, nu;
	if (!proto) {
		proto = Plain.prototype;
		delete ObjectType[id];
	}
	nu = proto;
	old = getPrototypeOf(this);
	if (old === nu) return;
	if ((ns = this.ns)) {
		while (ns !== ObjectType) {
			delete ns[id];
			ns = getPrototypeOf(ns);
			if (ns === Base) break;
		}
	}
	this.__proto__ = proto;
	if (proto._id_) {
		proto = proto.ns;
		if (proto) {
			while (proto !== ObjectType) {
				proto[id] = this;
				proto = getPrototypeOf(proto);
				if (proto === Base) break;
			}
		}
	}

	// Fix relations proto
	getOwnPropertyNames(this).forEach(protoDeep.bind(this, nu));

	if (old._id_) remove.call(old._children_, this);
	if (nu._id_) {
		if (!nu.hasOwnProperty('_children_')) {
			defineProperty(nu, '_children_', d('', []));
		}
		nu._children_.push(this);
	}
	if (old._id_) old.emit('delete', this);
	if (nu._id_) nu.emit('add', this);
}));

signal = require('../_internals/signal');
history = signal.history;
