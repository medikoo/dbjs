'use strict';

var d              = require('es5-ext/lib/Object/descriptor')
  , validateValues = require('../utils/validate-values')
  , relation       = require('./')
  , SetReadOnly    = require('./set-read-only')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , getPrototypeOf = Object.getPrototypeOf

  , hashTypes = {object: true, 'relation-set-item': true };

Object.defineProperties(relation, {
	value: d.gs(function () {
		var value = this.__value;
		if ((typeof value === 'function') && !value._id_) {
			if (value.length) return value;
			if (this.external) {
				if (value._resolved_) return value._value_;
				value._value_ = value.call(this.obj);
				value._resolved_ = true;
				return value._value_;
			}
			value = value.call(this.obj);
			if (this.multiple) return new SetReadOnly(this.ns, value);
			return (value == null) ? null : this.ns.normalize(value);
		}
		if (this.multiple) return this;
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
			this.$$setValue(value);
			this._signal_(value);
			return;
		}
		value = this.ns.is(value) ? value : this.ns.prototype.$create(value);
		this.$$setValue(value);
		this._signal_(value);
	}),
	$$setValue: d(function (value) {
		if (this.hasOwnProperty('_value')) {
			if (value === undefined) {
				delete this._value;
				getPrototypeOf(this).on('update', this._update_);
				if (!this.hasOwnProperty('_descriptor_')) delete this.obj[this.name];
			} else if (this._value === value) {
				return;
			} else {
				this._value = value;
			}
		} else {
			if (value === undefined) return;
			defineProperty(this, '_value', d('cw', value));
			getPrototypeOf(this).off('update', this._update_);
			if (!this.hasOwnProperty('_descriptor_')) {
				this._descriptor_.enumerable =
					hashTypes.hasOwnProperty(this.obj._type_);
				defineProperty(this.obj, this.name, this._descriptor_);
			}
		}

		value = this._value;
		if ((typeof value === 'function') && !value._type_ && !value.length &&
			 !this.external) {
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
	objectValue: d.gs(function () {
		var value = this.value, type;
		if (value == null) return value;
		type = typeof value;
		if ((type === 'object') || (type === 'function')) return value;
		value = Object(value);
		value.__proto__ = this.ns.prototype;
		return value;
	})
});
