// Set wrap for function results

'use strict';

var contains    = require('es5-ext/lib/Array/prototype/contains')
  , copy        = require('es5-ext/lib/Array/prototype/copy')
  , uniq        = require('es5-ext/lib/Array/prototype/uniq')
  , d           = require('es5-ext/lib/Object/descriptor')
  , callable    = require('es5-ext/lib/Object/valid-callable')
  , ReadOnlySet = require('../utils/read-only-set')

  , isArray = Array.isArray
  , call = Function.prototype.call
  , defineProperties = Object.defineProperties

  , filterNull = function (value) { return value != null; }
  , RelSet;

RelSet = module.exports = function (ns, value) {
	if (isArray(value)) {
		value = uniq.call(value.map(ns.normalize, ns).filter(filterNull));
	} else if (value == null) {
		value = [];
	} else {
		value = ns.normalize(value);
		value = (value == null) ? [] : [value];
	}

	defineProperties(this, {
		_ns: d('c', ns),
		_value: d('c', value),
		count: d('c', value.length)
	});
};

RelSet.prototype = Object.create(ReadOnlySet.prototype, {
	constructor: d(RelSet),
	has: d(function (value) {
		return contains.call(this._value, this.__ns.normalize(value));
	}),
	forEach: d(function (fn/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(fn);
		this._value.forEach(function (value, index) {
			call.call(fn, thisArg, value, null, this, index);
		}, this);
	}),
	values: d.gs(function () {
		return copy.call(this._value);
	})
});
