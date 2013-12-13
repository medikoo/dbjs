'use strict';

var d = require('d/d')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties;

module.exports = function (descriptor, property, accessCollector) {
	var accessSniff;

	defineProperties(descriptor, {
		_resolve_: d(function (sKey) {
			var desc;
			if (sKey === 'reverse') {
				if (!this.hasOwnProperty('__descriptors__')) return;
				if (!hasOwnProperty.call(this.__descriptors__, sKey)) return;
			}
			desc = this.__descriptors__[sKey];
			if (desc) return desc._resolveValue_();
		}),
		_normalize_: d(function (sKey, value) {
			return (this.__descriptors__[sKey] || property)._normalizeValue_(value);
		}),
		_get_: d(function (sKey) {
			if (accessSniff) accessSniff.push([this, sKey]);
			return this._resolve_(sKey);
		}),
		_getPropertyLastEvent_: d(function (sKey) {
			var desc = this._getCurrentDescriptor_(sKey);
			return desc ? desc._lastEvent_ : null;
		}),
		_getPropertyLastModified_: d(function (sKey) {
			var event = this._getPropertyLastEvent_(sKey);
			return event ? event.stamp : 0;
		}),
		_has_: d(function (sKey) {
			var desc = this.__descriptors__[sKey];
			if (!desc) return false;
			return desc._hasValue_(this);
		})
	});

	accessCollector.on('register', function (value) { accessSniff = value; });
	accessCollector.on('unregister', function (value) { accessSniff = null; });
};
