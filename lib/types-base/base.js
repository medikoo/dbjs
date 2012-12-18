'use strict';

var remove           = require('es5-ext/lib/Array/prototype/remove')
  , i                = require('es5-ext/lib/Function/i')
  , isFunction       = require('es5-ext/lib/Function/is-function')
  , d                = require('es5-ext/lib/Object/descriptor')
  , startsWith       = require('es5-ext/lib/String/prototype/starts-with')
  , serialize        = require('../_internals/serialize')
  , validateFunction = require('../_internals/validate-function')
  , protoDeep        = require('../_internals/proto-deep')

  , slice = Array.prototype.slice
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys

  , nameRe = /^[A-Z][0-9a-zA-Z]*$/
  , Base, Plain, Relation, RelTransport
  , define, getConstructor, signal, history;

getConstructor = function () {
	return function Self(value) {
		return Self.is(value) ? value :
				Self.prototype.create.apply(Self.prototype, arguments);
	};
};

module.exports = Base = getConstructor();
Plain = require('../_internals/plain');
Plain.create(Base);
Relation = require('../_internals/relation');
define = require('../_internals/define-basic');
RelTransport = require('../_internals/rel-transport');

defineProperties(Base, {
	_id_: d('c', 'Base'),
	create: d('c', function (name) {
		var error;
		if ((error = this.validateNS.apply(this, arguments))) throw error;

		return this.$create.apply(this, arguments);
	}),
	validateNS: d('c', function (name) {
		if (!nameRe.test(name)) return new Error(name + " is not a valid name");
		if (Base.hasOwnProperty(name)) return new Error(name + " is already taken");

		// Normalize arguments
		return this.verifyNS.apply(this, slice.call(arguments, 1));
	}),
	$create: d('c', function (name) {
		var constructor = this.$$create(name);
		signal(constructor, this);
		constructor.$construct.apply(constructor, slice.call(arguments, 1));
		return constructor;
	}),
	$$create: d('c', function (name) {
		var constructor = Plain.create.call(this, getConstructor());
		defineProperties(constructor, { _id_: d(name) });
		defineProperties(constructor.prototype, {
			_id_: d(name + '#'),
			ns: d('c', constructor)
		});

		defineProperty(Base, name, d('c', constructor));
		if (!this.hasOwnProperty('_children_')) {
			defineProperty(this, '_children_', d('', []));
			if (!this.prototype.hasOwnProperty('_children_')) {
				defineProperty(this.prototype, '_children_', d('', []));
			}
		}
		this._children_.push(constructor);
		this.prototype._children_.push(constructor.prototype);
		this.emit('add', constructor, name);
		this.prototype.emit('add', constructor.prototype, name + '#');
		return constructor;
	}),
	_forEachObject_: d('c', function (cb) {
		getOwnPropertyNames(this).forEach(function (name) {
			var value;
			if (!startsWith.call(name, '__')) return;
			if (name === '__value') return;
			value = this[name];
			if (!value._id_) return;
			if (!value.hasOwnProperty('_value')) return;
			cb(value, value._id_, this);
		}, this);
	}),
	rel: d('c', function (data) {
		if (data == null) return this;
		return new RelTransport(this, data);
	}),
	required: d.gs('c', function () {
		return new RelTransport(this, { required: true });
	}),

	coerce: d('c', function (value) { return value; }),
	_serialize_: d('c', serialize)
});

defineProperty(Plain, '$$proto', d('c', function (nu) {
	var old = getPrototypeOf(this);
	if (!nu) {
		nu = Plain;
		delete Base[this._id_];
	}
	if (old === nu) return;
	if (!nu.prototype) {
		// Should never happen, but we better take it easy
		// It's result of corrupted database (via e.g. malformed/not-proper import
		// messages) or trial of fixing the corrupted database
		Plain.prototype.$$proto.call(this, nu);
		return;
	}
	this.__proto__ = nu;
	this.prototype.__proto__ = nu.prototype;

	// Fix relations proto
	getOwnPropertyNames(this).forEach(protoDeep.bind(this, nu));
	getOwnPropertyNames(this.prototype)
		.forEach(protoDeep.bind(this, nu.prototype));

	if (old !== Plain) remove.call(old._children_, this);
	if (nu !== Plain) {
		if (!nu.hasOwnProperty('_children_')) {
			defineProperty(nu, '_children_', d('', []));
		}
		nu._children_.push(this);
	}
	if (old !== Plain) old.emit('delete', this, this._id_);
	if (nu !== Plain) nu.emit('add', this, this._id_);
}));

defineProperty(Base.prototype, '_forEachObject_', d(function (cb) {
	keys(this).forEach(function (name) {
		var value;
		if (!this.hasOwnProperty('__' + name)) return;
		value = this['__' + name];
		if (!value._id_) return;
		cb(value, value._id_, this);
	}, this);
}));

define(Base, 'verifyNS', function (construct, nsProps, objProps) {
	// Normalize arguments
	if (!isFunction(construct)) {
		objProps = nsProps;
		nsProps = construct;
		construct = null;
	} else if (!nsProps) {
		nsProps = { construct: construct };
	} else {
		nsProps.construct = construct;
	}

	return this.combineErrors(nsProps && this.validatePropertiesNew(nsProps),
		objProps && this.prototype.validatePropertiesNew(objProps));
});
defineProperties(Base.__verifyNS, {
	_normalize: d(i),
	validate: d(validateFunction)
});

define(Base, '$construct', function (construct, nsProps, objProps) {
	// Normalize arguments
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
defineProperties(Base.__$construct, {
	_normalize: d(i),
	validate: d(validateFunction)
});

// Following (plus constructor) should be carefully implemented by
// each namespace (ignore underscored functions)

// NS.is(value)
// Whether value represents value from given namespace
define(Base, 'is', function () { return true; });
defineProperties(Base.__is, {
	_normalize: d(i),
	validate: d(validateFunction)
});

// NS.normalize(value)
// Tries to normalize value into an instance, but without creating new
// *database object* (that derives from Base.Object)
// If it's not possible returns null
define(Base, 'normalize', function (value) { return value; });
defineProperties(Base.__normalize, {
	_normalize: d(i),
	validate: d(validateFunction)
});

// NS.validate(data)
// Tells whether it is ok to obtain an instance out of given data.
// Data may already be an instance.
// On ok returns undefined, if not ok returns error object that
// describes the issue(s)
define(Base, 'validate', function (value) { return null; });
defineProperties(Base.__validate, {
	_normalize: d(i),
	validate: d(validateFunction)
});

define(Base.prototype, 'create', function (value) {
	var error = this.ns.validate.apply(this.ns, arguments);
	if (error) throw error;
	return this.$create.apply(this, arguments);
});
defineProperties(Base.prototype.__create, {
	_normalize: d(i),
	validate: d(validateFunction)
});

define(Base.prototype, '$create', function (value) { return value; });
defineProperties(Base.prototype.__$create, {
	_normalize: d(i),
	validate: d(validateFunction)
});

defineProperty(Base, 'Base', d('c', Base));
defineProperty(Base.prototype, '_id_', d('c', 'Base#'));
define(Base.prototype, 'toString', Object.prototype.toString);
defineProperties(Base.prototype.__toString, {
	_normalize: d(i),
	validate: d(validateFunction)
});

Relation.prototype.__ns._value = Base;
signal = require('../_internals/signal');
history = signal.history;
