'use strict';

var create    = require('es5-ext/object/create')
  , callable  = require('es5-ext/object/valid-callable')
  , d         = require('d/d')
  , DbjsError = require('../error')
  , Iterator  = require('./iterator')

  , call = Function.prototype.call
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties, keys = Object.keys
  , isValidName = RegExp.prototype.test.bind(/^[a-z][A-Za-z0-9]*$/);

module.exports = function (db, descriptor) {
	var defineAccessors, accessors = create(null);

	defineAccessors = function (key) {
		var descs, accessor;
		descs = {};
		descs[key] = accessor = d.gs('', function () {
			return this._get_(key);
		}, function (value) {
			this._set_(key, this._validateSet_(key, value));
		});

		descs['$' + key] = d.gs('', function () {
			return this._getOwnDescriptor_(key);
		});
		descs['_' + key] = d.gs('', function () {
			return this.object._getDpObservable_(this._sKey_, key);
		});
		defineProperties(descriptor, descs);
		accessor.enumerable = accessor.configurable = true;
		accessors[key] = accessor;
		return key;
	};

	defineProperties(descriptor, {
		_accessors_: d('', accessors),
		_serialize_: d(function (key) {
			if (key == null) return null;
			key = String(key);
			if (!isValidName(key) || (key === 'value')) return null;
			if (hasOwnProperty.call(accessors, key)) return key;
			return defineAccessors(key);
		}),
		clear: d(function () {
			var sKeys;
			if (!this.hasOwnProperty('__descriptors__')) return;
			sKeys = keys(this.__descriptors__);
			sKeys.forEach(this._validateDelete_, this);
			db._postponed_ += 1;
			sKeys.forEach(this._delete_, this);
			db._postponed_ -= 1;
		}),
		delete: d(function (key) {
			key = this._serialize_(key);
			if (key == null) return false;
			return this._delete_(this._validateDelete_(key));
		}),
		entries: d(function () { return new Iterator(this, 'key+value'); }),
		forEach: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1], iterator, result;
			callable(cb);
			iterator = this.entries();
			result = iterator._next();
			while (result !== undefined) {
				call.call(cb, thisArg, this._get_(iterator.__list__[result]),
					iterator.__list__[result], this);
				result = iterator._next();
			}
		}),
		get: d(function (key) {
			key = this._serialize_(key);
			if (key == null) return;
			return this._get_(key);
		}),
		has: d(function (key) {
			key = this._serialize_(key);
			if (key == null) return false;
			return this._has_(key);
		}),
		keys: d(function () { return new Iterator(this, 'key'); }),
		set: d(function (key, value) {
			key = this._serialize_(key);
			if (key == null) {
				throw new DbjsError(key + " is invalid property name",
					'INVALID_PROPERTY_NAME');
			}
			return this._set_(key, this._validateSet_(key, value));
		}),
		size: d.gs(function () {
			var size, data, key;
			if (this.hasOwnProperty('__size__')) return this.__size__;
			size = 0;
			data = this.__descriptors__;
			for (key in data) {
				if (data[key]._hasValue_(this)) ++size;
			}
			return size;
		}),
		values: d(function () { return new Iterator(this, 'value'); }),
		setProperties: d(function (data) {
			return this._setProperties_(this._validateSetProperties_(data));
		})
	});
};
