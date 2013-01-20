'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , validateValues = require('../utils/validate-values')
  , relation       = require('./')
  , SetReadOnly    = require('./set-read-only')

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
			if (this.__multiple.__value) return new SetReadOnly(this.ns, value);
			return (value == null) ? null : this.ns.normalize(value);
		}
		if (this.__multiple.__value) return this;
		return value;
	}, function self(value) {
		var error = this.validate(value);
		if (error) throw error;
		this.$setValue(value);
	}),
	$setValue: d(function (value) {
		if (this.multiple) {
			this._reset_(value);
			return;
		}
		if ((value == null) || ((typeof value === 'function') && !value._type_)) {
			this._signal_(value);
			return;
		}
		value = this.ns.is(value) ? value : this.ns.prototype.$create(value);
		this._signal_(value);
	}),
	$$setValue: d(function (nu) {
		var old;
		if (this.hasOwnProperty('_value')) {
			old = this._value;
			if (nu === undefined) {
				delete this._value;
				getPrototypeOf(this).on('change', this._update_);
				if (!this.hasOwnProperty('_descriptor_')) delete this.obj[this.name];
			} else if (this._value === nu) {
				return;
			} else {
				this._value = nu;
				if (nu && nu._type_ === 'object') nu.on('selfupdate', this._update_);
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
		if ((typeof nu === 'function') && !nu._type_ && !nu.length &&
				!this.__external.__value) {
			this._setGetter_();
		} else {
			this._deleteGetter_();
			this._update_();
		}
	}),
	validateValue: d(function (value) {
		var error, index;
		if ((error = this.ns.prototype.validateCreate(value))) return error;
		if (this.validateRelation) {
			if ((error = this.validateRelation(value))) return error;
		}
		if (this.unique && ((index = this._index_))) {
			if (index.get(this.ns._serialize_(this.ns.normalize(value))).count) {
				return new TypeError(value + " is already set on other object");
			}
		}
		return null;
	}),
	validateCreateValue: d(function (value, data) {
		var error, index;
		if (!data) data = this;
		if ((error = data.ns.prototype.validateCreate(value))) return error;
		if (data.validateRelation) {
			if ((error = data.validateRelation(value))) return error;
		}
		if (data.unique && ((index = this._selfIndex_))) {
			if (index.get(data.ns._serialize_(data.ns.normalize(value))).count) {
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
	$delete: d(function () {
		this._forEachRelation_(itemDelete);
		this._forEachItem_(itemDelete);
		this._itemPrototype_.$delete();
		if (this.hasOwnProperty('_value')) this._signal_();
	}),
	delete: d(function () {
		var error = this.validate(), defined;
		if (error) throw error;
		defined = this.hasOwnProperty('_value');
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
