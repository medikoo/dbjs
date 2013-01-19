'use strict';

var d             = require('es5-ext/lib/Object/descriptor')
  , callable      = require('es5-ext/lib/Object/valid-callable')
  , startsWith    = require('es5-ext/lib/String/prototype/starts-with')
  , proto         = require('../_proto')
  , combineErrors = require('../utils/combine-errors')
  , getIndexKey   = require('../utils/get-index-key')

  , call = Function.prototype.call
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , getOwnPropertyNames = Object.getOwnPropertyNames

  , relation, isValidNsRef;

isValidNsRef = function (name) { return (name[0] !== name[0].toLowerCase()); };

relation = defineProperties(require('./'), {
	__value: d('', undefined),
	$$create: d(function (obj) {
		var rel = proto.$$create.call(this, obj._id_ + ':' + this.name)
		  , value, index, key;
		defineProperties(rel, {
			obj: d('', obj),
			_count_: d(0),
			_lastValue_: d('w', null),
			__value: d('w', value = this.__value),
			_update_: d(rel.__update_.bind(rel))
		});
		defineProperty(obj, '__' + this.name, d('', rel));
		rel._ns.on('change', rel._update_);
		this.on('change', rel._update_);
		if (((key = getIndexKey(value))) && ((index = rel._index_))) {
			index.add(key, obj);
		}
		return rel;
	}),
	__update_: d(function () {
		var nu = this._value, old = this.__value, index, key, ns, normalize;
		if ((typeof nu === 'function') && !nu._type_) {
			if (nu.length || this.__external.__value || this._getter_.once) {
				this.__value = nu;
			} else {
				nu = this.__value = this.ns.normalize(nu.call(this.obj));
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
		defineProperties(rel, {
			name: d.gs('', function () { return name; }),
			obj: d('', proto),
			_count_: d(0),
			_lastValue_: d('w', null),
			__value: d('w', undefined),
			_update_: d(rel.__update_.bind(rel)),
			_descriptor_: d('', dscr = d.gs('c', function () {
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
			}))
		});

		defineProperty(proto, relName, d('', rel));
		defineProperty(proto, '_' + name, d.gs('', function () {
			if (!this.hasOwnProperty(relName)) this._fillRelationChain_(relName);
			return this[relName];
		}));
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
