// Set wrap for function results

'use strict';

var contains    = require('es5-ext/lib/Array/prototype/contains')
  , copy        = require('es5-ext/lib/Array/prototype/copy')
  , diff        = require('es5-ext/lib/Array/prototype/diff')
  , remove      = require('es5-ext/lib/Array/prototype/remove')
  , uniq        = require('es5-ext/lib/Array/prototype/uniq')
  , d           = require('es5-ext/lib/Object/descriptor')
  , callable    = require('es5-ext/lib/Object/valid-callable')
  , ReadOnlySet = require('../utils/read-only-set')

  , isArray = Array.isArray
  , call = Function.prototype.call
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , filterNull = function (value) { return value != null; }
  , RelSet;

RelSet = module.exports = function (ns, value) {
	defineProperty(this, '_ns', d('c', ns));
	value = this._normalize(value);
	defineProperties(this, {
		_value: d('c', value),
		count: d('c', value.length)
	});
};

RelSet.prototype = Object.create(ReadOnlySet.prototype, {
	constructor: d(RelSet),
	has: d(function (value) {
		return contains.call(this._value, this._ns.normalize(value));
	}),
	forEach: d(function (fn/*, thisArg*/) {
		var thisArg = arguments[1];
		callable(fn);
		this._value.forEach(function (value, index) {
			call.call(fn, thisArg, value, null, this, index);
		}, this);
	}),
	_normalize: d(function (value) {
		if (isArray(value)) {
			return uniq.call(value.map(this._ns.normalize, this._ns)
				.filter(filterNull));
		}
		if (value == null) return [];
		value = this._ns.normalize(value);
		return (value == null) ? [] : [value];
	}),
	_reset: d(function (value) {
		var data, item, changed;
		value = this._normalize(value);
		data = diff.call(this._value, value);
		while ((item = data.shift()) != null) {
			remove.call(this._value, item);
			this.emit('delete', item);
			changed = true;
		}
		if (this._value.length === value.length) return changed;
		data = diff.call(value, this._value);
		while ((item = data.shift()) != null) {
			this._value.push(item);
			this.emit('add', item);
			changed = true;
		}
		return changed;
	}),
	values: d.gs(function () {
		return copy.call(this._value);
	})
});
