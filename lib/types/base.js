'use strict';

var copy          = require('es5-ext/lib/Array/prototype/copy')
  , remove        = require('es5-ext/lib/Array/prototype/remove')
  , CustomError   = require('es5-ext/lib/Error/custom')
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
  , Base, baseProto, rel, setRelationProto, setItemProto
  , removeObjects, addObjects;

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

removeObjects = function (objects, ns) {
	objects.forEach(function (obj) {
		delete ns[obj._id_];
		ns.emit('delete', obj);
	});
	ns = getPrototypeOf(ns);
	if (ns._childType_ === 'object') removeObjects(objects, ns);
};

addObjects = function (objects, ns) {
	objects.forEach(function (obj) {
		ns[obj._id_] = obj;
		ns.emit('add', obj);
	});
	ns = getPrototypeOf(ns);
	if (ns._childType_ === 'object') addObjects(objects, ns);
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
			_root_: d('', constructor),
			_count_: d('w', 0)
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
		var old = getPrototypeOf(this), objects;
		if (!nu) nu = Base;
		if (old === nu) return;

		if (old._childType_ === 'object') objects = this.values;

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

		if (objects) {
			if (!old.isPrototypeOf(nu)) removeObjects(objects, old);
			if (nu._childType_ === 'object') {
				if (!nu.isPrototypeOf(old)) addObjects(objects, nu);
			} else if (this._childType_ !== 'object') {
				objects.forEach(function (obj) {
					delete this[obj._id_];
					this.emit('delete', obj);
				}, this);
			}
		} else if (nu._childType_ === 'object') {
			addObjects(this.values, nu);
		}
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
	}),
	compare: d('c', function (a, b) {
		if (a == null) {
			if (b == null) return 0;
			return -Infinity;
		}
		if (b == null) return Infinity;
		return String(a).localeCompare(b);
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
		var obj, ns, dscr;
		obj = proto.$$create.call(this, id);
		dscr = {
			_root_: d('', obj),
			_notEmitted_: d(true)
		};
		if (this._type_ === 'prototype') dscr._type_ = d('object');
		defineProperties(obj, dscr);
		ns = this.ns;
		while (ns._type_ && (ns !== Base)) {
			ns[id] = obj;
			++ns._count_;
			ns = getPrototypeOf(ns);
		}
		return obj;
	}),
	$$setValue: d(function (nu) {
		var ns, old, id, oldChain, nuChain;
		if (this._type_ !== 'object') {
			throw new CustomError("Forbidden", 'NO_OBJ_VALUE_SET');
		}
		if (!nu) nu = baseProto;
		old = getPrototypeOf(this);
		if (old === nu) {
			if (!this._notEmitted_) return;
			delete this._notEmitted_;
			// Object was just created, emit add events on namespace
			ns = this.ns;
			while (ns.hasOwnProperty(this._id_)) {
				ns.emit('add', this);
				ns = getPrototypeOf(ns);
			}
			return;
		}
		this.__proto__ = nu;

		remove.call(old._children_, this);
		if (!nu.hasOwnProperty('_children_')) {
			defineProperty(nu, '_children_', d('', []));
		}
		nu._children_.push(this);

		ns = old.ns;
		id = this._id_;
		oldChain = [];
		while (ns._type_ && (ns !== Base)) {
			oldChain.unshift(ns);
			ns = getPrototypeOf(ns);
		}
		ns = nu.ns;
		nuChain = [];
		while (ns._type_ && (ns !== Base)) {
			nuChain.unshift(ns);
			ns = getPrototypeOf(ns);
		}

		while (nuChain[0] && (nuChain[0] === oldChain[0])) {
			nuChain.shift();
			oldChain.shift();
		}
		while ((ns = oldChain.pop())) {
			delete ns[id];
			--ns._count_;
			ns.emit('delete', this);
		}
		while ((ns = nuChain.pop())) {
			ns[id] = this;
			++ns._count_;
			ns.emit('add', this);
		}

		// Fix relations proto
		this._forEachRelation_(setRelationProto.bind(nu));
	})
});
proto._children_.push(Base, Base.prototype);

relation.__ns.$$setValue(Base);
rel = Base.$get('$construct');
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
