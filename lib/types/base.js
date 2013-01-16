'use strict';

var remove        = require('es5-ext/lib/Array/prototype/remove')
  , isFunction    = require('es5-ext/lib/Function/is-function')
  , d             = require('es5-ext/lib/Object/descriptor')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , combineErrors = require('../utils/combine-errors')
  , serialize     = require('../utils/serialize')
  , objects       = require('../objects')
  , proto         = require('../_proto')
  , relation      = require('../_relation')
  , RelTransport  = require('../_relation/transport')

  , slice = Array.prototype.slice
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf

  , nameRe = /^[A-Z][0-9a-zA-Z]*$/
  , relTypes = { relation: true, 'relation-set-item': true }
  , Base, baseProto, protoDeep, rel;

protoDeep = function self(proto, name) {
	var prop, nuProto, relName;
	if (!startsWith.call(name, '__')) return;
	prop = this[name];
	if (!prop || !relTypes[prop._type_]) return;

	relName = name.slice(1);
	nuProto = proto[relName];
	remove.call(getPrototypeOf(prop)._children_, prop);
	prop.__proto__ = nuProto;
	if (!nuProto.hasOwnProperty('_children_')) {
		defineProperty(nuProto, '_children_', d('', []));
	}
	nuProto._children_.push(prop);
	getOwnPropertyNames(prop).forEach(self.bind(prop, nuProto));
	prop._update_();
};

Base = module.exports = objects.Base = function Self(value) {
	return Self.is(value) ? value :
			Self.prototype.create.apply(Self.prototype, arguments);
};
Base.__proto__ = proto;
defineProperties(Base, {
	_id_: d('', 'Base'),
	_type_: d('c', 'namespace'),
	_childType_: d('c', 'primitive'),
	Base: d('ce', Base),
	create: d('c', function (name) {
		var error = this.validateCreate.apply(this, arguments);
		if (error) throw error;
		return this.$create.apply(this, arguments);
	}),
	validateCreate: d('c', function (name) {
		if (!nameRe.test(name)) return new Error(name + " is not a valid name");
		if (name in Base) return new Error(name + " is already taken");
		return this.validateConstruction.apply(this, slice.call(arguments, 1));
	}),
	$create: d('c', function (name) {
		var constructor = this.$$create(name);
		constructor._signal_(this);
		constructor.$construct.apply(constructor, slice.call(arguments, 1));
		return constructor;
	}),
	$$create: d('c', function (id) {
		var constructor = function Self(value) {
			return Self.is(value) ? value :
					Self.prototype.create.apply(Self.prototype, arguments);
		};
		constructor.__proto__ = this;
		objects[id] = defineProperty(constructor, '_id_', d('', id));
		objects[id + '#'] = constructor.prototype = create(this.prototype, {
			constructor: d(constructor),
			ns: d(constructor),
			_id_: d('', id + '#')
		});
		if (!this.hasOwnProperty('_children_')) {
			defineProperty(this, '_children_', d('', []));
		}
		if (!this.prototype.hasOwnProperty('_children_')) {
			defineProperty(this.prototype, '_children_', d('', []));
		}
		this._children_.push(constructor);
		this.prototype._children_.push(constructor.prototype);
		return (Base[id] = constructor);
	}),
	$$setValue: d('c', function (nu) {
		var old = getPrototypeOf(this);
		if (!nu) nu = Base;
		if (old === nu) return;

		this.__proto__ = nu;
		this.prototype.__proto__ = nu.prototype;

		remove.call(old._children_, this);
		remove.call(old.prototype._children_, this.prototype);
		if (!nu.hasOwnProperty('_children_')) {
			defineProperty(nu, '_children_', d('', []));
		}
		if (!nu.prototype.hasOwnProperty('_children_')) {
			defineProperty(nu.prototype, '_children_', d('', []));
		}
		nu._children_.push(this);
		nu.prototype._children_.push(this);

		if (old === Base) Base[this._id_] = this;
		if (nu === Base) delete Base[this._id_];

		// Fix relations proto
		getOwnPropertyNames(this).forEach(protoDeep.bind(this, nu));
		getOwnPropertyNames(this.prototype)
			.forEach(protoDeep.bind(this, nu.prototype));
	}),
	rel: d('c', function (data) {
		if (data == null) return this;
		return new RelTransport(this, data);
	}),
	required: d.gs('c', function () {
		return new RelTransport(this, { required: true });
	}),
	_serialize_: d('c', serialize)
});

objects['Base#'] = baseProto = Base.prototype = create(proto, {
	_id_: d('', 'Base#'),
	_type_: d('prototype'),
	constructor: d(Base),
	ns: d(Base),
	create: d(Base.create),
	validateCreate: d(function (value) {
		if (!serialize(value)) {
			return new TypeError(value + ' is not valid dbjs value');
		}
		return null;
	}),
	$create: d(function (value) { return value; }),
	$$create: d(function (id) {
		var obj, ns;
		obj = proto.$$create.call(this, id);
		if (this._type_ === 'prototype') defineProperty(obj, '_type_', d('object'));
		ns = this.ns;
		while (ns._type_ && (ns !== Base)) {
			ns[id] = obj;
			ns = getPrototypeOf(ns);
		}
		return obj;
	}),
	$$setValue: d(function (nu) {
		var ns, old, id;
		if (!nu) nu = baseProto;
		old = getPrototypeOf(this);
		if (old === nu) return;
		this.__proto__ = nu;

		remove.call(old._children_, this);
		if (!nu.hasOwnProperty('_children_')) {
			defineProperty(nu, '_children_', d('', []));
		}
		nu._children_.push(this);

		ns = old.ns;
		id = this._id_;
		while (ns._type_ && (ns !== Base)) {
			delete ns[id];
			ns = getPrototypeOf(ns);
		}
		ns = nu.ns;
		while (ns._type_ && (ns !== Base)) {
			ns[id] = this;
			ns = getPrototypeOf(ns);
		}

		// Fix relations proto
		getOwnPropertyNames(this).forEach(protoDeep.bind(this, nu));
	})
});
proto._children_.push(Base, Base.prototype);

relation.__ns.$$setValue(Base);
rel = Base._getRel_('$construct');
rel.$$setValue(function (construct, nsProps, objProps) {
	if (!isFunction(construct)) {
		objProps = nsProps;
		nsProps = construct;
		construct = null;
	} else if (!nsProps) {
		nsProps = { $construct: construct };
	} else {
		nsProps.$construct = construct;
	}

	if (nsProps) this.$setProperties(nsProps);
	if (objProps) this.prototype.$setProperties(objProps);
});
rel._required.$$setValue(true);

rel = Base._getRel_('validateConstruction');
rel.$$setValue(function (construct, nsProps, objProps) {
	var error;
	if (!isFunction(construct)) {
		objProps = nsProps;
		nsProps = construct;
		construct = null;
	} else if (!nsProps) {
		nsProps = { construct: construct };
	} else {
		nsProps.construct = construct;
	}

	error = combineErrors(nsProps && this.validateCreateProperties(nsProps),
		objProps && this.prototype.validateCreateProperties(objProps));
	if (!error) return null;
	error.message = "Invalid properties";
	return error;
});
rel._required.$$setValue(true);

rel = Base._getRel_('is');
rel.$$setValue(function (value) { return true; });
rel._required.$$setValue(true);

rel = Base._getRel_('normalize');
rel.$$setValue(function (value) { return value; });
rel._required.$$setValue(true);

Base._toString.$$setValue(Function.prototype.toString);
