'use strict';

var forEach    = require('es5-ext/object/for-each')
  , validValue = require('es5-ext/object/valid-value')
  , d          = require('d/d')
  , DbjsError  = require('../error')
  , Event      = require('../event')
  , getMessage = require('../utils/get-sub-error-message')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (db, descriptor, property) {
	defineProperties(descriptor, {
		_assertWritable_: d(function (key) {
			var desc;
			if (this.hasOwnProperty('__descriptors__') &&
					hasOwnProperty.call(this.__descriptors__, key)) {
				desc = this.__descriptors__[key];
				if (desc.hasOwnProperty('_writable_')) {
					if (desc._writable_) return;
				} else if (getPrototypeOf(desc)._extensible_) {
					return;
				}
			} else if (this.__descriptors__[key]) {
				if (this.__descriptors__[key]._extensible_) return;
			} else if (this.__descriptorPrototype__._extensible_) {
				return;
			}
			throw new DbjsError("Property is read-only", 'NON_WRITABLE');
		}),
		_delete_: d(function (key) {
			var has, desc;
			if (this.hasOwnProperty(key)) delete this[key];
			db._postponed_ += 1;
			desc = this._getOwnDescriptor_(key);
			has = desc.hasOwnProperty('_value_');
			new Event(desc); //jslint: skip
			db._postponed_ -= 1;
			return has;
		}),
		_set_: d(function (key, value) {
			if (!this.hasOwnProperty(key)) {
				defineProperty(this, key, this._accessors_[key]);
			}
			db._postponed_ += 1;
			new Event(this._getOwnDescriptor_(key), value); //jslint: skip
			db._postponed_ -= 1;
			return this;
		}),
		_setProperties_: d(function (data) {
			db._postponed_ += 1;
			forEach(data, function (value, sKey) { this._set_(sKey, value); }, this);
			db._postponed_ -= 1;
			return this;
		}),
		_validateDelete_: d(function (key) {
			this._assertWritable_(key);
			return key;
		}),
		_validateSet_: d(function (key, value) {
			var desc;
			this._assertWritable_(key);
			if (value === undefined) {
				throw new DbjsError("Cannot set value to undefined", 'SET_UNDEFINED');
			}
			if (value === null) return value;
			desc = this._getDescriptor_(key);
			return desc.type.validate(value);
		}),
		_validateSetProperties_: d(function (props) {
			var errors, result;
			validValue(props);
			result = {};
			forEach(props, function (value, key) {
				var sKey = this._serialize_(key), error;
				if (key == null) {
					error = new DbjsError(key + " is invalid property name",
						'INVALID_PROPERTY_NAME');
					if (!errors) errors = [];
					errors.push(error);
					return;
				}
				try {
					result[sKey] = this._validateSet_(sKey, value);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (!errors) errors = [];
					e.key = key;
					errors.push(e);
				}
			}, this);
			if (!errors) return result;
			throw new DbjsError("Invalid properties:\n\t" +
				errors.map(getMessage).join('\t\n'), 'SET_PROPERTIES_ERROR',
				{ errors: errors });
		})
	});
};
