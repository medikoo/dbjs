'use strict';

var some = require('es5-ext/object/some')
  , d    = require('d')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties, getPrototypeOf = Object.getPrototypeOf;

module.exports = function (db, object, accessCollector) {
	var accessSniff;

	defineProperties(object, {
		_resolve_: d(function (sKey) {
			return this._getDescriptor_(sKey)._resolveValue_(this, sKey);
		}),
		_resolveGetter_: d(function (sKey) {
			return this._getDescriptor_(sKey)._resolveValueGetter_(this, sKey);
		}),
		_normalize_: d(function (sKey, value) {
			return this._getDescriptor_(sKey)._normalizeValue_(value);
		}),
		_get_: d(function (sKey) {
			if (accessSniff) accessSniff.push([this, sKey]);
			if (!accessSniff && this.hasOwnProperty('__observableProperties__')) {
				if (this.__observableProperties__[sKey]) return this.__observableProperties__[sKey].value;
			}
			return this._resolve_(sKey);
		}),
		_getMultipleSize_: d(function (sKey) {
			var data, size, desc, item, iKey;
			data = this.__multiples__[sKey];
			if (!data) return 0;
			size = 0;
			desc = this._getDescriptor_(sKey);
			for (iKey in data) {
				item = data[iKey];
				if (typeof item === 'number') {
					++size;
					continue;
				}
				if (!item._value_) continue;
				if (desc._normalizeValue_(item.key) == null) continue;
				++size;
			}
			return size;
		}),
		_hasOwnMultiple_: d(function (sKey) {
			if (!this.hasOwnProperty('__multiples__')) return false;
			if (!hasOwnProperty.call(this.__multiples__, sKey)) return false;
			return some(this.__multiples__[sKey], function (item) {
				if (typeof item === 'number') return true;
				return item._lastOwnEvent_;
			});
		}),
		_getPropertyLastEvent_: d(function (sKey) {
			var desc;
			desc = this._getCurrentDescriptor_(sKey);
			if (desc == null) return null;
			return desc._resolveLastEvent_(this, sKey);
		}),
		_getPropertyLastModified_: d(function (sKey) {
			var event = this._getPropertyLastEvent_(sKey);
			return event ? event.stamp : 0;
		}),
		_has_: d(function (sKey) {
			var desc = this.__descriptors__[sKey], current;
			if (desc) return desc._hasValue_(this);
			desc = this.__descriptorPrototype__;
			if (desc.nested) {
				if (!db.isObjectType(desc.type)) return false;
				while (!desc.hasOwnProperty('type')) desc = getPrototypeOf(desc);
				current = this;
				while (true) {
					if (current.hasOwnProperty('__objects__')) {
						if (current.__objects__[sKey]) return true;
					}
					if (current.hasOwnProperty('__descriptorPrototype__') &&
							(current.__descriptorPrototype__ === desc)) {
						break;
					}
					current = getPrototypeOf(current);
				}
				return false;
			}
			if (!desc.multiple) return false;
			if (!this.__sets__) return false;
			return Boolean(this.__sets__[sKey]);
		}),
		_hasOwn_: d(function (sKey) {
			var desc = this.__descriptors__[sKey];
			if (desc) return desc._hasOwnValue_(this);
			desc = this.__descriptorPrototype__;
			if (desc.nested) {
				if (!this.hasOwnProperty('__objects__')) return false;
				return hasOwnProperty.call(this.__objects__, sKey);
			}
			if (!desc.multiple) return false;
			if (!this.hasOwnProperty('__sets__')) return false;
			return hasOwnProperty.call(this.__sets__, sKey);
		}),
		_lastEvent_: d.gs(function () { return this._lastOwnEvent_; })
	});

	accessCollector.on('register', function (value) { accessSniff = value; });
	accessCollector.on('unregister', function (value) { accessSniff = null; });
};
