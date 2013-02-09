'use strict';

var copy          = require('es5-ext/lib/Array/prototype/copy')
  , remove        = require('es5-ext/lib/Array/prototype/remove')
  , isFunction    = require('es5-ext/lib/Function/is-function')
  , d             = require('es5-ext/lib/Object/descriptor')
  , extend        = require('es5-ext/lib/Object/extend-properties')
  , combineErrors = require('../utils/combine-errors')
  , serialize     = require('../utils/serialize')
  , getIndexKey   = require('../utils/get-index-key')
  , objects       = require('../objects')
  , proto         = require('../_proto')
  , relation      = require('../_relation')
  , RelTransport  = require('../_relation/transport')

  , slice = Array.prototype.slice
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

  , nameRe = /^[A-Z][0-9a-zA-Z]*$/
  , relDelete = function (rel) { rel.$delete(); }
  , Base, baseProto, rel, setRelationProto, setItemProto;

setItemProto = function (item) {
	var old = getPrototypeOf(item), nu = this._itemPrototype_;

	remove.call(old._children_, item);
	item.__proto__ = nu;
	if (!nu.hasOwnProperty('_children_')) {
		defineProperty(nu, '_children_', d('', []));
	}
	nu._children_.push(item);

	item._forEachRelation_(setRelationProto.bind(nu));
};

setRelationProto = function (rel) {
	var nu = this['_' + rel.name], old = getPrototypeOf(rel), key, index;

	// Clear old setup
	remove.call(old._children_, rel);

	// Update
	rel.__proto__ = nu;

	// Setup new
	if (!nu.hasOwnProperty('_children_')) {
		defineProperty(nu, '_children_', d('', []));
	}
	nu._children_.push(rel);

	// Fix indexing
	if (rel.obj && (rel.obj._type_ === 'prototype')) {
		if (rel.hasOwnProperty('__index_')) rel.__index_.setParent(nu._selfIndex_);
	} else if (rel.obj && (rel.obj._type_ === 'object')) {
		if ((key = getIndexKey(rel.__value))) {
			if (old.__index_) old.__index_.delete(key, rel.obj);
			if ((index = rel._index_)) index.add(key, rel.obj);
		}
	}

	// Update value if inherited
	if (!rel.hasOwnProperty('_value')) rel._update_();

	// Update base set item proto
	if (rel.hasOwnProperty('__itemPrototype_')) {
		setItemProto.call(nu, rel.__itemPrototype_);
	}

	// Update relations proto
	rel._forEachRelation_(setRelationProto.bind(nu));
};

Base = module.exports = objects.Base = function Self(value) {
	return Self.is(value) ? value :
			Self.prototype.create.apply(Self.prototype, arguments);
};
Base.__proto__ = proto;
extend(Base, Function.prototype);
delete Base.toString;

defineProperties(Base, {
	_id_: d('', 'Base'),
	_type_: d('c', 'namespace'),
	_childType_: d('c', 'primitive'),
	_root_: d('', Base),
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
		objects[id] = defineProperties(constructor, {
			_id_: d('', id),
			_root_: d('', constructor)
		});
		objects[id + '#'] = constructor.prototype = create(this.prototype, {
			constructor: d(constructor),
			ns: d(constructor),
			_id_: d('', id + '#'),
		});
		defineProperty(constructor.prototype, '_root_', d('',
				constructor.prototype));
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
		this._forEachRelation_(setRelationProto.bind(nu));
		this.prototype._forEachRelation_(setRelationProto.bind(nu.prototype));
	}),
	rel: d('c', function (data) {
		if (data == null) return this;
		return new RelTransport(this, data);
	}),
	required: d.gs('c', function () {
		return new RelTransport(this, { required: true });
	}),
	_serialize_: d('c', serialize),
	delete: d('c', function () {
		if (this.hasOwnProperty('_children_')) {
			copy.call(this._children_).forEach(function (child) { child.delete(); });
		}
		this.prototype._forEachRelation_(relDelete);
		this._forEachRelation_(relDelete);
		this._signal_();
	})
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
		defineProperty(obj, '_root_', d('', obj));
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
		this._forEachRelation_(setRelationProto.bind(nu));
	})
});
proto._children_.push(Base, Base.prototype);

relation.__ns.$$setValue(Base);
rel = Base.get('$construct');
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

rel = Base.get('validateConstruction');
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

rel = Base.get('is');
rel.$$setValue(function (value) { return true; });
rel._required.$$setValue(true);

rel = Base.get('normalize');
rel.$$setValue(function (value) { return value; });
rel._required.$$setValue(true);

Base._toString.$$setValue(Function.prototype.toString);
