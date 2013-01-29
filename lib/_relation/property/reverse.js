'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , proto       = require('../../_proto')
  , relation    = require('../')
  , simple      = require('../simple')
  , unserialize = require('../../utils/unserialize')

  , getPrototypeOf = Object.getPrototypeOf
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , nameRe = /^[a-zA-Z][0-9a-zA-Z]*$/

  , rel, setReverse, validate;

setReverse = function (rel, index) {
	var old = rel.__value
	  , nu = function () { return index.getReverse(this.ns._serialize_(this)); };
	nu._reverseRelGetter_ = true;

	index.on('change', function self(nuVal, oldVal, key) {
		if (rel.__value !== nu) {
			index.off('change', self);
			return;
		}
		unserialize(key)['_' + rel.name].emit('change', nuVal, oldVal);
	});
	rel.__value = rel._value = nu;
	rel.emit('change', nu, old);
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
			var index, revRel;
			if (!rel.__value) return;
			if ((old._childType_ === 'object') && (old._id_ !== 'Object')) {
				revRel = old.prototype['_' + rel.__value];
				if (revRel.hasOwnProperty('_value') && revRel._value &&
						revRel._value._reverseRelGetter_) {
					delete revRel._value;
				}
				revRel._update_();
			}
			if ((nu._childType_ === 'object') && (nu._id_ !== 'Object') &&
					((index = rel.obj._selfIndex_))) {
				setReverse(nu.prototype.get(rel.__value), index);
			}
		});
		return rel;
	}),
	__update_: d(function () {
		var nu = this.hasOwnProperty('_value') ? this._value : undefined
		  , old = this.__value, ns = this.obj.ns, index;

		this.__value = nu;

		if ((ns._childType_ === 'object') && (ns._id_ !== 'Object#')) {
			// Remove old reverse
			if (old && (nu !== old)) {
				rel = ns.prototype['_' + old];
				if (rel.hasOwnProperty('_value') && rel._value &&
						rel._value._reverseRelGetter_) {
					delete rel._value;
				}
				rel._update_();
			}

			// Set new reverse
			if (nu && ((index = this.obj._selfIndex_))) {
				setReverse(ns.prototype.get(nu), index);
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
				this._descriptor_.enumerable = false;
				defineProperty(this.obj, this.name, this._descriptor_);
			}
		}
		this._update_();
	}),
	validateValue: d(validate = function (name) {
		var obj = this.obj.obj, ns;
		if ((obj._type_ !== 'prototype') || (obj.ns._childType_ !== 'object') ||
				(obj._id_ === 'Object#')) {
			return new TypeError("Reverse properties can be configured only on" +
				" relations that are prototypes of Object namespaces");
		}
		ns = this.obj.ns;
		if ((ns._childType_ !== 'object') || (ns._id_ === 'Object')) {
			return new TypeError("Reverse properties can be configured only on" +
				" Object namespaces");
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
		if ((obj._type_ !== 'prototype') || (obj.ns._childType_ !== 'object')) {
			return new TypeError("Reverse properties can be configured only on" +
				" relations that are prototypes of Object namespaces");
		}
		if (name === true) return null;
		if (!nameRe.test(name)) return new TypeError(name + " is not a valid name");
		return null;
	})
});
