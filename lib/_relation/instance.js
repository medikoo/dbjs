'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , Proto          = require('../_proto')
  , combineErrors  = require('../utils/combine-errors')
  , serialize      = require('../utils/serialize')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , proto = Proto.prototype

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
		rel._ns.on('update', rel._update_);
		this.on('update', rel._update_);
		if ((value !== null) &&
				((typeof value !== 'function') || (value._type_ === 'namespace'))) {
			if (((index = rel._index_)) && ((key = serialize(value)))) {
				index.add(key, obj);
			}
		}
		return rel;
	}),
	__update_: d(function () {
		var nu = this._value, old = this.__value, index, key;
		if ((typeof nu === 'function') && !nu._type_) {
			if (nu.length || this.external || this._getter_.once) this.__value = nu;
			else nu = this.__value = this.ns.normalize(nu.call(this.obj));
		} else if (nu == null) {
			this.__value = nu;
		} else {
			nu = this.__value = this.ns.normalize(nu);
		}
		if (old !== nu) {
			if ((old != null) &&
					((typeof old !== 'function') || (old._type_ === 'namespace'))) {
				if (((index = this._index_)) && ((key = serialize(old)))) {
					index.delete(key, this.obj);
				}
			}
			if ((nu != null) &&
					((typeof nu !== 'function') || (nu._type_ === 'namespace'))) {
				if ((index || ((index = this._index_))) &&
						((key = this.ns._serialize_(nu)))) {
					index.add(key, this.obj);
				}
			}
			this.emit('update', nu, old);
		}
	}),
	$construct: d(function (ns, data) {
		this._ns.$$setValue(ns);
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

defineProperties(Proto, {
	_defineRel_: d('c', function (name) {
		var rel, dscr, relName, allowNS, base;
		base = typeof this === 'function' ? Proto : proto;
		relName = '__' + name;

		allowNS = isValidNsRef(name);
		rel = proto.$$create.call(relation, base._id_ + ':' + name);
		defineProperties(rel, {
			name: d.gs('', function () { return name; }),
			obj: d('', base),
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

		defineProperty(base, relName, d('', rel));
		defineProperty(base, '_' + name, d.gs('', function () {
			if (!this.hasOwnProperty(relName)) this._fillRelationChain_(relName);
			return this[relName];
		}));
		defineProperty(base, name, dscr);
		return rel;
	}),
	_fillRelationChain_: d('c', function (name) {
		var proto = getPrototypeOf(this);
		if (!proto.hasOwnProperty(name)) proto._fillRelationChain_(name);
		this[name].$$create(this);
	}),
	_getRel_: d('c', function (name) {
		if ((name in this) && this['__' + name] &&
				(this['__' + name]._type_ === 'relation')) {
			return this['_' + name];
		}
		this._defineRel_(name);
		return this['_' + name];
	})
});
defineProperties(proto, {
	_defineRel_: d(Proto._defineRel_),
	_fillRelationChain_: d(Proto._fillRelationChain_),
	_getRel_: d(Proto._getRel_)
});
