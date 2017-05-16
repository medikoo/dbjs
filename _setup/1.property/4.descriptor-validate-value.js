'use strict';

var toArray   = require('es5-ext/array/to-array')
  , uniq      = require('es5-ext/array/#/uniq')
  , pluck     = require('es5-ext/function/pluck')
  , d         = require('d')
  , DbjsError = require('../error')
  , isGetter  = require('../utils/is-getter')
  , serialize = require('../serialize/value')

  , getPrototypeOf = Object.getPrototypeOf
  , defineProperties = Object.defineProperties
  , getMessage = pluck('message');

module.exports = function (descriptor) {
	defineProperties(descriptor, {
		_validateDeleteValue_: d(function (obj, sKey) {
			var nuValue;
			if (this._reverse_) return this._reverse_._validateDelete_(obj);
			if (this.nested) {
				throw new DbjsError("Cannot delete nested object", 'NESTED_DELETE',
					{ descriptor: this });
			}
			if (this.multiple) {
				throw new DbjsError("Cannot delete multiple property", 'MULTIPLE_DELETE',
					{ descriptor: this });
			}
			if (!this.required) return sKey;
			if (obj._get_(sKey) == null) return sKey;
			if (this.hasOwnProperty('_value_')) nuValue = getPrototypeOf(this)._resolveInner_(obj, sKey);
			else nuValue = this._resolveValueValue_(obj, sKey);
			if (nuValue == null) {
				throw new DbjsError("Property is required", 'VALUE_REQUIRED', { descriptor: this });
			}
			if (isGetter(nuValue)) return sKey;
			if (this._normalizeValue_(nuValue) == null) {
				throw new DbjsError("Property is required", 'VALUE_REQUIRED', { descriptor: this });
			}
			return sKey;
		}),
		_validateSetValue_: d(function (obj, sKey, value) {
			if (value === undefined) {
				throw new DbjsError("Cannot set value to undefined", 'SET_UNDEFINED', { descriptor: this });
			}
			if (this._reverse_) return this._reverse_._validateSet_(obj, value);
			if (this.nested) {
				throw new DbjsError("Nested objects cannot be overriden", 'NESTED_OVERRIDE',
					{ descriptor: this });
			}
			if (isGetter(value)) return value;
			if (this.multiple) return this._validateMultiple_(obj, sKey, value);
			if (value === null) {
				if (this.required) {
					throw new DbjsError("Property is required", 'VALUE_REQUIRED',
						{ descriptor: this });
				}
				return value;
			}
			value = this.type.validate(value, this);
			if (this.unique) this._validateUnique_(obj, sKey, value);
			return value;
		}),
		_validateUnique_: d(function (obj, sKey, value) {
			var vKey = serialize(value), mapData, desc, l;
			desc = obj.__descriptors__[sKey];
			if (!desc) return value;
			while (!desc.hasOwnProperty('unique')) desc = getPrototypeOf(desc);
			desc = desc._getOwnDescriptor_('unique');
			mapData = desc.object._getReverseMap_(sKey).__mapValuesData__;
			if (!mapData[vKey]) return value;
			mapData = mapData[vKey].__setData__;
			l = mapData.length;
			if (!l) return value;
			if ((l === 1) && (mapData[0] === obj)) return value;
			throw new DbjsError(value + " is already assigned to other object", 'VALUE_NOT_UNIQUE',
				{ descriptor: this });
		}),
		_validateMultiple_: d(function (obj, sKey, value) {
			var errors, set, iKey;
			if (value == null) {
				throw new DbjsError("Cannot set multiple property to " + value, 'MULTIPLE_NULL',
					{ descriptor: this });
			}
			value = toArray(value);
			if (!value.length) {
				if (this.required) {
					set = getPrototypeOf(obj).__multiples__[sKey];
					if (set) {
						for (iKey in set) {
							if (!set[iKey]._value_) continue;
							if (obj._normalize_(set[iKey].key) == null) continue;
							return value; //jslint: ignore
						}
					}
					throw new DbjsError("Property is required. List must not be empty", 'MULTIPLE_REQUIRED',
						{ descriptor: this });
				}
				return value;
			}
			value = uniq.call(value).map(function (value) {
				if (value == null) {
					if (!errors) errors = [];
					errors.push(new DbjsError(value + " is not a value", 'MULTIPLE_NULL_VALUE',
						{ descriptor: this }));
					return;
				}
				try {
					value = this.type.validate(value, this);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (!errors) errors = [];
					errors.push(e);
					return;
				}
				if (this.unique) {
					try {
						this._validateUnique_(obj, sKey, value);
					} catch (e2) {
						if (e2.name !== 'DbjsError') throw e2;
						if (!errors) errors = [];
						errors.push(e2);
						return;
					}
				}
				return value;
			}, this);
			if (!errors) return value;
			throw new DbjsError("Some values are invalid:\n\t" +
				errors.map(getMessage).join('\t\n'), 'MULTIPLE_ERRORS',
					{ errors: errors, descriptor: this });
		})
	});
};
