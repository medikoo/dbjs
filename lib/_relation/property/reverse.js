'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , memoize  = require('memoizee/lib/regular')
  , proto    = require('../../_proto')
  , relation = require('../')
  , simple   = require('../simple')

  , getPrototypeOf = Object.getPrototypeOf
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/
  , hashTypes = { object: true, 'relation-set-item': true }

  , rel, setReverse, validate, getReverse;

getReverse = memoize(function (index) {
	return function () {
		return index.getReverse(this.ns._serialize_(this));
	};
});

setReverse = function (rel, nu) {
	var old = rel.__value;
	if (old !== nu) {
		rel.__value = nu;
		rel.emit('change', nu, old);
	}
	if (!rel.hasOwnProperty('_children_')) return;
	rel._children_.forEach(function (rel) { setReverse(rel, nu); });
};

rel = simple(proto._defineRel_('reverse'), relation);
defineProperties(rel, {
	$$create: d(function (obj) {
		var rel = proto.$$create.call(this, obj._id_ + ':' + this.name);
		defineProperties(rel, {
			obj: d('', obj),
			__value: d('w', undefined),
			_update_: d(this.__update_.bind(rel))
		});
		defineProperty(obj, '__reverse', d('', rel));
		obj._ns.on('change', function (nu, old) {
			var index;
			if (!rel.__value) return;
			old = old.prototype;
			if ((old._type_ === 'object') && (old._id_ !== 'Object#')) {
				old['_' + rel.__value]._update_();
			}
			nu = nu.prototype;
			if ((nu._type_ === 'object') && (nu._id_ !== 'Object#') &&
					((index = rel.obj._selfIndex_))) {
				setReverse(nu._getRel_(rel.__value), getReverse(index));
			}
		});
		return rel;
	}),
	__update_: d(function () {
		var nu = this.hasOwnProperty('_value') ? this._value : undefined
		  , old = this.__value, ns = this.obj.ns.prototype, index;

		this.__value = nu;

		if ((ns._type_ === 'object') && (ns._id_ !== 'Object#')) {
			// Remove old reverse
			if (old && (nu !== old)) ns['_' + old]._update_();

			// Set new reverse
			if (nu && ((index = this.obj._selfIndex_))) {
				setReverse(ns._getRel_(nu), getReverse(index));
			}
		}
		if (nu !== old) this.emit('change', nu, old);
	}),
	$setValue: d(function (value) {
		if (value == null) {
			value = undefined;
		} else if (value === true) {
			value = this.obj.obj.ns._id_;
			value = value[0].toLowerCase() + value.slice(1);
		} else {
			value = String(value);
		}
		this._signal_(value);
	}),
	$$setValue: d(function (value) {
		if (this.hasOwnProperty('_value')) {
			if (value === undefined) {
				delete this._value;
				getPrototypeOf(this).on('change', this._update_);
				if (!this.hasOwnProperty('_descriptor_')) delete this.obj[this.name];
			} else if (this._value !== value) {
				this._value = value;
			}
		} else if (value !== undefined) {
			defineProperty(this, '_value', d('cw', value));
			getPrototypeOf(this).off('change', this._update_);
			if (!this.hasOwnProperty('_descriptor_')) {
				this._descriptor_.enumerable =
					hashTypes.hasOwnProperty(this.obj._type_);
				defineProperty(this.obj, this.name, this._descriptor_);
			}
		}
		this._update_();
	}),
	validateValue: d(validate = function (name) {
		var obj = this.obj.obj, ns;
		if ((obj._type_ !== 'object') || (obj._id_ === 'Object#')) {
			return new TypeError("Reverse properties can be configured only on" +
				" object relations");
		}
		ns = this.obj.ns.prototype;
		if (ns._type_ !== 'object') {
			return new TypeError("Reverse properties can be configured only on" +
				" object namespaces");
		}
		if (name === true) {
			name = obj.ns._id_;
			name = name[0].toLowerCase() + name.slice(1);
		}
		if (!nameRe.test(name)) return new TypeError(name + " is not a valid name");
		return null;
	}),
	validateCreateValue: d(function (name, data) {
		if (!data) data = this;
		var obj = this.obj.obj;
		if (obj._type_ !== 'object') {
			return new TypeError("Reverse properties can be configured only on" +
				" object relations");
		}
		if (name === true) return null;
		if (!nameRe.test(name)) return new TypeError(name + " is not a valid name");
		return null;
	})
});
