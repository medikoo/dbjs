'use strict';

var some = require('es5-ext/object/some')
  , d    = require('d/d')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties;

module.exports = function (object, accessCollector) {
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
			if (this.hasOwnProperty('__observables__')) {
				if (this.__observables__[sKey]) return this.__observables__[sKey].value;
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
			if (this.hasOwnProperty('__observables__')) {
				if (this.__observables__[sKey]) {
					return this.__observables__[sKey]._lastEvent_;
				}
			}
			desc = this._getCurrentDescriptor_(sKey);
			if (desc == null) return null;
			return desc._resolveLastEvent_(this, sKey);
		}),
		_getPropertyLastModified_: d(function (sKey) {
			var event = this._getPropertyLastEvent_(sKey);
			return event ? event.stamp : 0;
		}),
		_has_: d(function (sKey) {
			var desc = this.__descriptors__[sKey];
			if (!desc) return false;
			return desc._hasValue_(this);
		}),
		_hasOwn_: d(function (sKey) {
			var desc = this.__descriptors__[sKey];
			if (!desc) return false;
			return desc._hasOwnValue_(this);
		}),
		_lastEvent_: d.gs(function () { return this._lastOwnEvent_; })
	});

	accessCollector.on('register', function (value) { accessSniff = value; });
	accessCollector.on('unregister', function (value) { accessSniff = null; });
};
