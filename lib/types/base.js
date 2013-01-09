'use strict';

var remove        = require('es5-ext/lib/Array/prototype/remove')
  , isFunction    = require('es5-ext/lib/Function/is-function')
  , d             = require('es5-ext/lib/Object/descriptor')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , combineErrors = require('../utils/combine-errors')
  , serialize     = require('../utils/serialize')
  , Proto         = require('../_proto')
  , relation      = require('../_relation')
  , RelTransport  = require('../_relation/transport')

  , slice = Array.prototype.slice
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf
  , proto = Proto.prototype

  , nameRe = /^[A-Z][0-9a-zA-Z]*$/
  , relTypes = { relation: true, 'relation-set-item': true }
  , Base, getConstructor, baseProto, protoDeep, rel;

getConstructor = function () {
	return function Self(value) {
		return Self.is(value) ? value :
				Self.prototype.create.apply(Self.prototype, arguments);
	};
};

protoDeep = function self(proto, name) {
	var prop, nuProto, relName;
	if (!startsWith.call(name, '__')) return;
	prop = this[name];
	if (!prop) return;
	if (!relTypes[prop._type_]) return;

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

module.exports = Base = Proto.$$create(getConstructor(), 'Base');
relation.__ns.$$setValue(Base);

defineProperties(Base, {
	_type_: d('c', 'namespace'),
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
		var constructor = Proto.$$create.call(this, getConstructor(), id);
		defineProperty(constructor.prototype, 'ns', d('c', constructor));
		Base[id] = constructor;
		this.emit('add', constructor, id);
		this.prototype.emit('add', constructor.prototype, id + '#');
		return constructor;
	}),
	$$proto: d('c', function (nu) {
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

		old.emit('delete', this, this._id_);
		nu.emit('add', this, this._id_);
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

baseProto = defineProperties(Base.prototype, {
	_type_: d('primitive'),
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
		ns = this.ns;
		while (ns.prototype._type_ === 'object') {
			ns[id] = obj;
			ns = getPrototypeOf(ns);
		}
		this.emit('add', obj, id);
		return obj;
	}),
	$$proto: d(function (nu) {
		var ns, old, id = this._id_;
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
		while (ns.prototype._type_ === 'object') {
			delete ns[id];
			ns = getPrototypeOf(ns);
		}
		ns = nu.ns;
		while (ns.prototype._type_ === 'object') {
			ns[id] = this;
			ns = getPrototypeOf(ns);
		}

		// Fix relations proto
		getOwnPropertyNames(this).forEach(protoDeep.bind(this, nu));

		old.emit('delete', this, this._id_);
		nu.emit('add', this, this._id_);
	})
});
baseProto._defineRel_('$construct');
baseProto._defineRel_('validateConstruction');
