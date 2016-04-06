'use strict';

var create     = require('es5-ext/object/create')
  , callable   = require('es5-ext/object/valid-callable')
  , d          = require('d')
  , DbjsError  = require('../error')
  , serialize  = require('../serialize/key')
  , Iterator   = require('./iterator')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperty = Object.defineProperty, getPrototypeOf = Object.getPrototypeOf
  , defineProperties = Object.defineProperties;

module.exports = function (db, object) {
	var defineAccessors, accessors = create(null)
	  , v8FixStep = 1000, v8FixInsertCount = 1, v8PropsCount = 0;

	defineAccessors = function (key, sKey) {
		var accessor;
		if (v8PropsCount > (v8FixStep * v8FixInsertCount)) {
			// Workaround for v8 bug which affects v0.10 node branch
			// https://github.com/joyent/node/issues/6839
			defineProperty(object, '___v8PropsFix___', d(null));
			delete object.___v8PropsFix___;
			++v8FixInsertCount;
		}
		v8PropsCount += 3;
		accessor = d.gs('c', function () {
			return this._get_(sKey);
		}, function (value) {
			this._set_(sKey, this._validateSet_(sKey, value));
		});
		if (!object.hasOwnProperty(key)) defineProperty(object, key, accessor);

		if (!object.hasOwnProperty('$' + key)) {
			defineProperty(object, '$' + key,
				d.gs('c', function () { return this._getOwnDescriptor_(sKey); }));
		}
		if (!object.hasOwnProperty('_' + key)) {
			defineProperty(object, '_' + key, d.gs('c', function () {
				if (this.isKeyStatic(key)) return this[key];
				return this._getObservable_(sKey);
			}));
		}
		accessor.enumerable = true;
		accessors[sKey] = accessor;
	};

	defineProperties(object, {
		_accessors_: d('', accessors),
		_keys_: d('', create(null)),
		_serialize_: d(function (key) {
			var sKey = serialize(key);
			if (sKey == null) return sKey;
			if (hasOwnProperty.call(this._keys_, sKey)) return sKey;
			this._keys_[sKey] = key;
			if (typeof key === 'string') defineAccessors(key, sKey);
			return sKey;
		}),

		clear: d(function () {
			this._validateClear_();
			this._clear_();
		}),
		delete: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) return false;
			return this._delete_(this._validateDelete_(sKey));
		}),
		deleteValue: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) return false;
			return this._deleteValue_(this._validateDelete_(sKey));
		}),
		entries: d(function () { return new Iterator(this, 'key+value'); }),
		forEach: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1], iterator, result;
			callable(cb);
			iterator = this.entries();
			result = iterator._next();
			while (result !== undefined) {
				call.call(cb, thisArg, this._get_(iterator.__list__[result]),
					this._keys_[iterator.__list__[result]], this);
				result = iterator._next();
			}
		}),
		some: d(function (cb/*, thisArg*/) {
			var thisArg = arguments[1], iterator, result;
			callable(cb);
			iterator = this.entries();
			result = iterator._next();
			while (result !== undefined) {
				if (call.call(cb, thisArg, this._get_(iterator.__list__[result]),
						this._keys_[iterator.__list__[result]], this)) {
					iterator._unBind();
					return true;
				}
				result = iterator._next();
			}
			return false;
		}),
		every: d(function (cb/*, thisArg*/) {
			callable(cb);
			return !this.some(function () { return !apply.call(cb, this, arguments); }, arguments[1]);
		}),
		get: d(function (key) {
			var sKey;
			if (this.isKeyStatic(key)) return this[key];
			sKey = this._serialize_(key);
			if (sKey == null) return;
			return this._get_(sKey);
		}),
		has: d(function (key) {
			var sKey = this._serialize_(key);
			if (sKey == null) return false;
			return this._has_(sKey);
		}),
		keys: d(function () { return new Iterator(this, 'key'); }),
		set: d(function (key, value) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			return this._set_(sKey, this._validateSet_(sKey, value));
		}),
		size: d.gs(function () {
			var size, data, sKey, desc, current, done;
			if (this.hasOwnProperty('__size__')) return this.__size__;
			size = 0;
			data = this.__descriptors__;
			for (sKey in data) {
				if (data[sKey]._hasValue_(this)) ++size;
			}
			desc = this.__descriptorPrototype__;
			if (desc.nested) {
				if (!db.isObjectType(desc.type)) return size;
				while (!desc.hasOwnProperty('type')) desc = getPrototypeOf(desc);
				current = this;
				done = create(null);
				while (true) {
					if (current.hasOwnProperty('__objects__')) {
						for (sKey in current.__objects__) {
							if (data[sKey]) continue;
							if (done[sKey]) continue;
							++size;
							done[sKey] = true;
						}
					}
					if (current.hasOwnProperty('__descriptorPrototype__') &&
							(current.__descriptorPrototype__ === desc)) {
						break;
					}
					current = getPrototypeOf(current);
				}
				return size;
			}
			if (desc.multiple) {
				for (sKey in this.__sets__) if (!data[sKey]) ++size;
			}
			return size;
		}),
		values: d(function () { return new Iterator(this, 'value'); }),

		setProperties: d(function (data) {
			return this._setProperties_(this._validateSetProperties_(data));
		}),
		define: d(function (key, descriptor) {
			var sKey = this._serialize_(key);
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			return this._define_(sKey, this._validateDefine_(sKey, descriptor));
		}),
		defineProperties: d(function (descs) {
			return this._defineProperties_(this._validateDefineProperties_(descs));
		})
	});
};
