'use strict';

var d             = require('es5-ext/lib/Object/descriptor')
  , callable      = require('es5-ext/lib/Object/valid-callable')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , proto         = require('../_proto')
  , combineErrors = require('../utils/combine-errors')
  , getIndexKey   = require('../utils/get-index-key')
  , SetReadOnly   = require('./set-read-only')

  , call = Function.prototype.call
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/
  , descriptor = { configurable: false, enumerable: false, writable: false }
  , descriptorGet = { configurable: false, enumerable: false }
  , descriptorCreate = {
	obj: { configurable: false, enumerable: false, writable: false },
	_root_: { configurable: false, enumerable: false, writable: false },
	_count_: { value: 0, configurable: true, enumerable: false,
			writable: true },
	_lastValue_: { value: null, configurable: false, enumerable: false,
			writable: true },
	__value: { configurable: false, enumerable: false, writable: true },
	_update_: { configurable: true, enumerable: false, writable: true }
}, descriptorDefine = {
	name: { configurable: false, enumerable: false },
	obj: { configurable: false, enumerable: false, writable: false },
	_count_: { value: 0, configurable: true, enumerable: false,
			writable: true },
	_lastValue_: { value: null, configurable: false, enumerable: false,
			writable: true },
	__value: { value: undefined, configurable: false, enumerable: false,
			writable: true },
	_update_: { configurable: true, enumerable: false, writable: true },
	_descriptor_: { configurable: false, enumerable: false }
}, relation, isValidNsRef;

isValidNsRef = function (name) { return (name[0] !== name[0].toLowerCase()); };

relation = defineProperties(require('./'), {
	__value: d('', undefined),
	$$create: d(function (obj) {
		var rel = proto.$$create.call(this, obj._id_ + ':' + this.name)
		  , value, index, key;

		descriptorCreate.obj.value = obj;
		descriptorCreate._root_.value = obj._root_;
		value = descriptorCreate.__value.value = this.__value;
		descriptorCreate._update_.value = rel.__update_.bind(rel);
		defineProperties(rel, descriptorCreate);

		descriptor.value = rel;
		defineProperty(obj, '__' + this.name, descriptor);

		this.on('change', rel._update_);
		if (((key = getIndexKey(value))) && ((index = rel._index_))) {
			index.add(key, obj);
		}
		return rel;
	}),
	__update_: d(function () {
		var nu = this._value, old = this.__value, index, key, ns, normalize;
		if ((typeof nu === 'function') && !nu._type_) {
			if (nu.length || this.__external.__value || !this._getter_ ||
					this._getter_.once) {
				this.__value = nu;
			} else {
				nu = this.__ns.__value.normalize(nu.call(this.obj));
				if (!this.__multiple.__value) {
					this.__value = nu;
				} else if (this.__value && this.__value._isSet_) {
					if (this.__value._reset(nu)) this.emit('change', this.__value, old);
					nu = this.__value;
				} else {
					nu = this.__value = new SetReadOnly(this.__ns.__value, nu);
				}
			}
		} else if (nu == null) {
			this.__value = nu;
		} else {
			ns = this.__ns.__value;
			normalize = ns.__normalize.__value;
			nu = this.__value = normalize.call(ns, nu);
		}
		if (old !== nu) {
			if (((key = getIndexKey(old))) && ((index = this._index_))) {
				index.delete(key, this.obj);
			}
			if ((index || ((index = this._index_))) && ((key = getIndexKey(nu)))) {
				index.add(key, this.obj);
			}
			this.emit('change', nu, old);
		}
	}),
	$construct: d(function (ns, data) {
		this._ns._signal_(ns);
		if (data) this.$setProperties(data);
	}),
	validateConstruction: d(function (ns, data) {
		var error;
		if (!ns || (ns._type_ !== 'namespace')) {
			error = new TypeError(ns + " is not a namespace");
		}
		return combineErrors(error,
			(data == null) ? null : this.validateCreateProperties(data));
	})
});

defineProperties(proto, {
	_defineRel_: d(function (name) {
		var rel, dscr, relName, allowNS;
		relName = '__' + name;

		allowNS = isValidNsRef(name);
		rel = proto.$$create.call(relation, proto._id_ + ':' + name);

		descriptorDefine.name.get = function () { return name; };
		descriptorDefine.obj.value = proto;
		descriptorDefine._update_.value = rel.__update_.bind(rel);
		dscr = descriptorDefine._descriptor_.value = d.gs('c', function () {
			if (!this.hasOwnProperty(relName)) this._fillRelationChain_(relName);
			return this[relName].value;
		}, function (value) {
			var rel;
			if (!this.hasOwnProperty(relName)) this._fillRelationChain_(relName);
			rel = this[relName];
			if (!allowNS || (typeof value !== 'function') ||
					(value._type_ !== 'namespace')) {
				rel.value = value;
			} else {
				rel.ns = value;
			}
		});
		defineProperties(rel, descriptorDefine);

		descriptor.value = rel;
		defineProperty(proto, relName, descriptor);
		descriptorGet.get = function () {
			if (!this.hasOwnProperty(relName)) this._fillRelationChain_(relName);
			return this[relName];
		};
		defineProperty(proto, '_' + name, descriptorGet);
		defineProperty(proto, name, dscr);
		return rel;
	}),
	_fillRelationChain_: d(function (name) {
		var proto = getPrototypeOf(this);
		if (!proto.hasOwnProperty(name)) proto._fillRelationChain_(name);
		this[name].$$create(this);
	}),
	get: d(function (name) {
		if ((name in this) && this['__' + name] &&
				(this['__' + name]._type_ === 'relation')) {
			return this['_' + name];
		}
		if (!nameRe.test(name)) {
			return new Error("'" + name + "' is not valid name");
		}
		this._defineRel_(name);
		return this['_' + name];
	}),
	hasProperty: d(function (name) {
		return ((name in this) && this['__' + name] &&
			(this['__' + name]._type_ === 'relation')) || false;
	}),
	$get: d(function (name) {
		if ((name in this) && this['__' + name] &&
				(this['__' + name]._type_ === 'relation')) {
			return this['_' + name];
		}
		this._defineRel_(name);
		return this['_' + name];
	}),
	_forEachRelation_: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(cb);
		getOwnPropertyNames(this).forEach(function (name) {
			var rel;
			if (!startsWith.call(name, '__')) return;
			rel = this[name];
			if (!rel) return;
			if (rel._type_ !== 'relation') return;
			call.call(cb, thisArg, rel, rel._id_, this);
		}, this);
	})
});
