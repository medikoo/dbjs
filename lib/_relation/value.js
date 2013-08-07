'use strict';

var isUniq          = require('es5-ext/lib/Array/prototype/is-uniq')
  , d               = require('es5-ext/lib/Object/descriptor')
  , validateValues  = require('../utils/validate-values')
  , relation        = require('./')
  , SetReadOnly     = require('./set-read-only')
  , setEmitter      = require('./set-emitter')
  , isDynGetter     = require('./_is-dyn-getter')
  , dynamicTriggers = require('./_dynamic-triggers')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , hashTypes = { object: true, prototype: true, 'relation-set-item': true }
  , itemDelete = function (item) { item.$delete(); };

Object.defineProperties(relation, {
	value: d.gs(function () {
		var value = this.__value;
		if ((typeof value === 'function') && !value._id_) {
			if (value.length) return value;
			if (this.__external.__value) {
				if (value._resolved_) return value._value_;
				value._value_ = value.call(this.obj);
				value._resolved_ = true;
				return value._value_;
			}
			value = value.call(this.obj);
			if (this.__multiple.__value) {
				return new SetReadOnly(this.__ns.__value, value);
			}
			return (value == null) ? null : this.__ns.__value.normalize(value);
		}
		if (this.__multiple.__value) return (value && value._isSet_) ? value : this;
		return value;
	}, function self(value) {
		var error = this.validate(value);
		if (error) throw error;
		this.$setValue(value);
	}),
	$setValue: d(function (value) {
		var ns;
		if (this.__multiple.__value) {
			this._reset_(value);
			return;
		}
		if ((value == null) || ((typeof value === 'function') && !value._type_)) {
			this._signal_(value);
			return;
		}
		ns = this.__ns.__value;
		value = ns.is(value) ? value : ns.prototype.$create(value);
		this._signal_(value);
	}),
	$$setValue: d(function (nu) {
		var old, parent;
		if (this.hasOwnProperty('_value')) {
			old = this._value;
			if (nu === undefined) {
				delete this._value;
				getPrototypeOf(this).on('change', this._update_);
				if (!this.hasOwnProperty('_descriptor_')) delete this.obj[this.name];
			} else if (this._value !== nu) {
				if ((typeof this._value === 'function') &&
						this._value._hasDynamicTriggers) {
					if (this._value.origin === nu) return;
					this._value.clearAll();
				}
				this._value = nu;
				if (nu && nu._type_ === 'object') nu.on('selfupdate', this._update_);
			} else {
				return;
			}
			if (old && old._type_ === 'object') old.off('selfupdate', this._update_);
		} else {
			if (nu === undefined) return;
			defineProperty(this, '_value', d('cw', nu));
			getPrototypeOf(this).off('change', this._update_);
			if (!this.hasOwnProperty('_descriptor_')) {
				this._descriptor_.enumerable =
					hashTypes.hasOwnProperty(this.obj._type_);
				defineProperty(this.obj, this.name, this._descriptor_);
			}
			if (nu && nu._type_ === 'object') nu.on('selfupdate', this._update_);
		}

		nu = this._value;
		if (typeof nu === 'function') {
			if (!nu._type_ && !nu.length && !this.__external.__value) {
				this._setGetter_();
			} else if (isDynGetter(nu)) {
				nu = this._value = dynamicTriggers(this, nu);
				this._setGetter_();
			} else {
				this._deleteGetter_();
				this._update_();
			}
		} else {
			this._deleteGetter_();
			this._update_();
		}
		if (!this.__multiple.__value) return;
		if (old === undefined) {
			parent = getPrototypeOf(this);
			if (parent._type_ !== 'relation') return;
			if (!parent.__multiple.__value) return;
			setEmitter.emitSet(this, setEmitter.getItems(parent), 'delete');
			setEmitter.getItems.clearAll();
		} else if (nu === undefined) {
			parent = getPrototypeOf(this);
			if (parent._type_ !== 'relation') return;
			if (!parent.__multiple.__value) return;
			setEmitter.emitSet(this, setEmitter.getItems(parent), 'add');
			setEmitter.getItems.clearAll();
		}
	}),
	validateValue: d(function (value) {
		var error, index, ns = this.__ns.__value, constraint;
		if ((error = ns.prototype.validateCreate(value))) return error;
		if (this.validateRelation) {
			if ((error = this.validateRelation(value))) return error;
		}
		if ((ns === ns.String) || ns.String.isPrototypeOf(ns)) {
			value = String(value);
			constraint = this.__pattern.__value;
			if (constraint && !value.match(constraint)) {
				return new TypeError("Invalid value");
			}
			constraint = this.__max.__value;
			if ((constraint != null) && (value.length > constraint)) {
				return new TypeError(value + " is too long");
			}
			constraint = this.__min.__value;
			if ((constraint != null) && (value.length < constraint)) {
				return new TypeError(value + " is too short");
			}
		} else if ((ns === ns.Number) || ns.Number.isPrototypeOf(ns)) {
			value = Number(value);
			constraint = this.__max.__value;
			if ((constraint != null) && (value > constraint)) {
				return new TypeError(value + " is invalid");
			}
			constraint = this.__min.__value;
			if ((constraint != null) && (value < constraint)) {
				return new TypeError(value + " is invalid");
			}
		}
		if (this.unique && ((index = this._index_))) {
			if (index.get(ns._serialize_(ns.normalize(value))).count) {
				return new TypeError(value + " is already set on other object");
			}
		}
		return null;
	}),
	validateCreateValue: d(function (value, data) {
		var error, index, normalized, ns, unique;
		ns = data ? data.ns : this.__ns.__value;
		unique = data ? data.unique : this.__unique.__value;
		if (!data) data = this;
		if ((error = ns.prototype.validateCreate(value))) return error;
		if (data.validateRelation) {
			if ((error = data.validateRelation(value))) return error;
		}
		if (unique && ((index = this._selfIndex_))) {
			normalized = ns.normalize(value);
			if (normalized == null) return null;
			if (index.get(ns._serialize_(normalized)).count) {
				return new TypeError(value + " is already set on other object");
			}
		}
		return null;
	}),
	_validate_: d(function (data, value, validate) {
		if (data.writeOnce && (this._value != null)) {
			return new TypeError("Property is read-only");
		}
		if (value === null) {
			if (data.required) return new TypeError("Property is required");
			return null;
		}
		if ((typeof value === 'function') && !value._type_) return null;

		if (isArray(value)) {
			if (!data.multiple) {
				return new TypeError("Invalid value");
			}
			if (!value.length) {
				if (!data.required) return null;
				return new TypeError("Invalid value");
			}
			if (!isUniq.call(value)) return new TypeError("Values are not unique");
			return validateValues(this, value, validate, data);
		}
		return validate.call(this, value, data);
	}),
	validate: d(function (value) {
		if (value === undefined) {
			if (this.required && (getPrototypeOf(this)._value == null)) {
				return new TypeError("Property is required");
			}
			return null;
		}
		return this._validate_(this, value, this.validateValue);
	}),
	validateCreate: d(function (value, data) {
		if (!data) data = this;
		if (value === undefined) {
			if (data.required && this._value == null) {
				return new TypeError("Property is required");
			}
			return null;
		}
		return this._validate_(data || this, value, this.validateCreateValue);
	}),
	isValid: d(function () {
		if (!this.__required.__value) return true;
		if (this.__multiple.__value) return Boolean(this.count);
		return (this.__value != null);
	}),
	$delete: d(function () {
		if (this.hasOwnProperty('_children_')) this._children_.forEach(itemDelete);
		this._forEachRelation_(itemDelete);
		this._forEachItem_(itemDelete);
		this._itemPrototype_.$delete();
		if (this.hasOwnProperty('_value')) this._signal_();
	}),
	delete: d(function () {
		var defined = this.hasOwnProperty('_value');
		this.$delete();
		if (!defined) this._signal_();
	}),
	objectValue: d.gs(function () {
		var value = this.value, type;
		if (value == null) return value;
		type = typeof value;
		if ((type === 'object') || (type === 'function')) return value;
		value = Object(value);
		value.__proto__ = this.__ns.__value.prototype;
		return value;
	})
});
