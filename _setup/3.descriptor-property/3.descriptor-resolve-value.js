'use strict';

var d = require('d/d')

  , defineProperties = Object.defineProperties;

module.exports = function (property) {
	defineProperties(property, {
		_value_: d('', undefined),
		_resolveValue_: d(function () {
			var value = this._value_;
			return (value == null) ? value : this._normalizeValue_(value);
		}),
		_hasValue_: d(function () {
			return (this._value_ !== undefined);
		}),
		_normalizeValue_: d(function (value) {
			return this.type.normalize(value, this);
		})
	});
};
