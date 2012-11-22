// Set wrap for function results

'use strict';

var contains = require('es5-ext/lib/Array/prototype/contains')
  , copy     = require('es5-ext/lib/Array/prototype/copy')
  , uniq     = require('es5-ext/lib/Array/prototype/uniq')
  , d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')

  , isArray = Array.isArray
  , call = Function.prototype.call
  , defineProperties = Object.defineProperties

  , filterNull = function (value) { return value != null; }
  , readOnly = function () { throw new TypeError("Set is read-only"); }
  , RelSet;

RelSet = module.exports = function (ns, value) {
	if (isArray(value)) {
		value = uniq.call(value.map(ns._normalize, ns).filter(filterNull));
	} else if (value == null) {
		value = [];
	} else {
		value = ns._normalize(value);
		value = (value == null) ? [] : [value];
	}

	defineProperties(this, {
		_ns: d('c', ns),
		_value: d('c', value),
		count: d('c', value.length)
	});
};

defineProperties(RelSet.prototype, {
	add: d('c', readOnly),
	remove: d('c', readOnly),
	has: d('c', function (value) {
		return contains.call(this._value, this._ns._normalize(value));
	}),
	forEach: d('c', function (fn/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(fn);
		this._value.forEach(function (value, index) {
			call.call(fn, thisArg, value, null, this, index);
		}, this);
	}),
	values: d.gs('c', function () {
		return copy.call(this._value);
	})
});
