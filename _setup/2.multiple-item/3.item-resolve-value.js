'use strict';

var d = require('d/d')

  , defineProperties = Object.defineProperties;

module.exports = function (item) {
	defineProperties(item, {
		_value_: d('', undefined),
		_resolveValue_: d(function () {
			var value = this._value_;
			return (value === undefined) ? value : this._normalizeValue_(value);
		}),
		_hasValue_: d(function () {
			return (this._value_ !== undefined);
		}),
		_normalizeValue_: d(function (value) {
			if (!value) return false;
			return (this.__master__._normalize_(this._pKey_, this._key_) != null);
		})
	});
};
