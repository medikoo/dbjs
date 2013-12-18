'use strict';

var pluck        = require('es5-ext/function/pluck')
  , copy         = require('es5-ext/object/copy')
  , forEach      = require('es5-ext/object/for-each')
  , mixin        = require('es5-ext/object/mixin')
  , primitiveSet = require('es5-ext/object/primitive-set')
  , validValue   = require('es5-ext/object/valid-value')
  , d            = require('d/d')
  , DbjsError    = require('../error')
  , Event        = require('../event')
  , isGetter     = require('../utils/is-getter')
  , serialize    = require('../serialize/key')

  , push = Array.prototype.push
  , keys = Object.keys, hasOwnProperty = Object.prototype.hasOwnProperty
  , create = Object.create, defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf
  , getMessage = pluck('message');

module.exports = function (db, object) {
	defineProperties(object, {
		_assertWritable_: d(function (sKey) {
			var desc;
			if (this.hasOwnProperty('__descriptors__') &&
					hasOwnProperty.call(this.__descriptors__, sKey)) {
				desc = this.__descriptors__[sKey];
				if (desc.hasOwnProperty('_writable_')) {
					if (desc._writable_) return;
				} else if (getPrototypeOf(desc)._extensible_) {
					return;
				}
			} else if (this.__descriptors__[sKey]) {
				if (this.__descriptors__[sKey]._extensible_) return;
			} else if (this.__descriptorPrototype__._extensible_) {
				return;
			}
			throw new DbjsError("Property is read-only", 'NON_WRITABLE');
		}),
		_delete_: d(function (sKey) {
			var desc = this._getDescriptor_(sKey), has, result;

			db._postponed_ += 1;
			if (desc._reverse_) {
				result = desc._reverse_._delete_(this);
				db._postponed_ -= 1;
				return result;
			}
			desc = this._getOwnDescriptor_(sKey);
			has = desc.hasOwnProperty('_value_');
			new Event(desc); //jslint: skip
			if (desc.hasOwnProperty('__descriptors__')) {
				keys(desc.__descriptors__).forEach(desc._delete_, desc);
			}
			db._postponed_ -= 1;
			return has;
		}),
		_set_: d(function (sKey, value) {
			var desc = this._getDescriptor_(sKey);

			db._postponed_ += 1;
			if (desc._reverse_) {
				desc._reverse_._set_(this, value);
				db._postponed_ -= 1;
				return this;
			}

			if (!desc.multiple || isGetter(value)) {
				new Event(this._getOwnDescriptor_(sKey), value); //jslint: skip
				db._postponed_ -= 1;
				return this;
			}
			this._setMultiple_(sKey, value);
			db._postponed_ -= 1;
			return this;
		}),
		_setMultiple_: d(function (sKey, value) {
			var current;
			if (this.hasOwnProperty('__multiples__') &&
					hasOwnProperty.call(this.__multiples__, sKey)) {
				current = primitiveSet.apply(null, keys(this.__multiples__[sKey]));
			}
			value.forEach(function (value) {
				var item = this._getOwnMultipleItem_(sKey, value, serialize(value));
				if (current) delete current[item._sKey_];
				new Event(item, true); //jslint: skip
			}, this);
			if (!current) return this;
			keys(current).forEach(function (sKey) {
				var item = this[sKey];
				if (!item.hasOwnProperty('_value_')) return;
				new Event(item, undefined); //jslint: skip
			}, this.__multiples__[sKey]);
			return this;
		}),
		_setProperties_: d(function (props) {
			db._postponed_ += 1;
			forEach(props, function (value, sKey) { this._set_(sKey, value); }, this);
			db._postponed_ -= 1;
			return this;
		}),
		_define_: d(function (sKey, meta) {
			var desc, value;
			db._postponed += 1;
			desc = this._getOwnDescriptor_(sKey);
			if (meta.value !== undefined) {
				value = meta.value;
				delete meta.value;
			}
			desc._setProperties_(meta);
			if (value !== undefined) this._set_(sKey, value);
			db._postponed -= 1;
			return this;
		}),
		_defineProperties_: d(function (descs) {
			db._postponed_ += 1;
			forEach(descs, function (value, sKey) {
				this._define_(sKey, value);
			}, this);
			db._postponed_ -= 1;
			return this;
		}),
		_multipleAdd_: d(function (pSKey, key, sKey) {
			new Event(this._getOwnMultipleItem_(pSKey, key, sKey), true); //jslint: skip
		}),
		_multipleDelete_: d(function (pSKey, key, sKey) {
			var item = this._getOwnMultipleItem_(pSKey, key, sKey)
			  , has = item.hasOwnProperty('_value_') && Boolean(item._value_);
			new Event(item); //jslint: skip
			return has;
		}),
		_validateDelete_: d(function (sKey) {
			var desc;
			this._assertWritable_(sKey);
			desc = this._getDescriptor_(sKey);
			if (!this.hasOwnProperty('__descriptors__') ||
					!hasOwnProperty.call(this.__descriptors__, sKey)) {
				desc = create(desc);
			}

			return desc._validateDeleteValue_(this, sKey);
		}),
		_validateSet_: d(function (sKey, value) {
			var desc;
			this._assertWritable_(sKey);
			desc = this._getDescriptor_(sKey);
			if (!this.hasOwnProperty('__descriptors__') ||
					!hasOwnProperty.call(this.__descriptors__, sKey)) {
				desc = create(desc);
			}
			return desc._validateSetValue_(this, sKey, value);
		}),
		_validateSetProperties_: d(function (props) {
			var errors, result;
			validValue(props);
			result = {};
			forEach(props, function (value, key) {
				var sKey = this._serialize_(key);
				try {
					result[sKey] = this._validateSet_(sKey, value);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (!errors) errors = [];
					errors.push(e);
				}
			}, this);
			if (!errors) return result;
			throw new DbjsError("Invalid properties:\n\t" +
				errors.map(getMessage).join('\t\n'), 'SET_PROPERTIES_ERROR',
				{ errors: errors });
		}),
		_validateDefine_: d(function (sKey, meta) {
			var value, desc, hasValue;
			if (this.hasOwnProperty('__descriptors__') &&
					hasOwnProperty.call(this.__descriptors__, sKey)) {
				throw new DbjsError("Property is already defined", 'PROPERTY_DEFINED');
			}
			meta = copy(meta);
			if (meta.hasOwnProperty('value')) {
				hasValue = true;
				value = meta.value;
				delete meta.value;
			}
			desc = create(this._getDescriptor_(sKey));
			mixin(desc, desc._validateSetProperties_(meta));
			if (hasValue) meta.value = desc._validateSetValue_(this, sKey, value);
			return meta;
		}),
		_validateDefineProperties_: d(function (descs) {
			var errors, result;
			validValue(descs);
			result = {};
			forEach(descs, function (value, key) {
				var sKey = this._serialize_(key);
				try {
					result[sKey] = this._validateDefine_(sKey, value);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (errors) {
						if (e.errors) push.apply(errors, e.errors);
						else errors.push(e);
					} else {
						if (e.errors) errors = e.errors;
						else errors = [e];
					}
				}
			}, this);
			if (!errors) return result;
			throw new DbjsError("Invalid definitions:\n\t" +
				errors.map(getMessage).join('\t\n'), 'DEFINE_PROPERTIES_ERROR',
				{ errors: errors });
		}),
		_validateMultipleAdd_: d(function (pSKey, key) {
			var desc, original = key;
			this._assertWritable_(pSKey);
			if (key == null) {
				throw new DbjsError(key + " is not a value", 'ITEM_NULL_VALUE');
			}
			desc = this._getDescriptor_(pSKey);
			key = desc._normalizeValue_(key);
			if (key == null) {
				throw new DbjsError(original + " is an invalid value", 'INVALID_VALUE');
			}
			if (desc.unique) desc._validateUnique_(this, pSKey, key);
			return key;
		}),
		_validateMultipleDelete_: d(function (pSKey, key) {
			var desc, item, size, iKey, data;
			this._assertWritable_(pSKey);
			if (key == null) return key;
			desc = this._getDescriptor_(pSKey);
			key = desc._normalizeValue_(key);
			if (key == null) return key;
			if (!desc.required) return key;
			size = this._getMultipleSize_(pSKey);
			if (size > 1) return key;
			iKey = this._serialize_(key);
			data = this.__multiples__[pSKey];
			if (hasOwnProperty.call(data, iKey)) {
				item = data[iKey];
				if (item.hasOwnProperty('_value_') && item._value_) {
					throw new DbjsError("Property is required. List must not be empty",
						'MULTIPLE_REQUIRED');
				}
			}
			return key;
		})
	});
};
