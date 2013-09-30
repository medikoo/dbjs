// Set wrap for function results

'use strict';

var contains    = require('es5-ext/array/#/contains')
  , copy        = require('es5-ext/array/#/copy')
  , diff        = require('es5-ext/array/#/diff')
  , flatten     = require('es5-ext/array/#/flatten')
  , remove      = require('es5-ext/array/#/remove')
  , uniq        = require('es5-ext/array/#/uniq')
  , callable    = require('es5-ext/object/valid-callable')
  , d           = require('d/d')
  , ReadOnlySet = require('../utils/read-only-set')
  , ObjectList  = require('../_proto/object-ordered-list')

  , isArray = Array.isArray, map = Array.prototype.map
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
	union: d(function (a/* …others*/) {
		return new RelSet(this._ns, this._value.concat(flatten.call(
			map.call(arguments, function (set) { return set.values; })
		)));
	}),
	_normalize: d(function (value) {
		if (value == null) return [];
		if (isArray(value)) {
			return uniq.call(value.map(this._ns.normalize, this._ns)
				.filter(filterNull));
		}
		if (value._isSet_) {
			return value.values.map(this._ns.normalize, this._ns).filter(filterNull);
		}
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
		if (this._value.length !== value.length) {
			data = diff.call(value, this._value);
			while ((item = data.shift()) != null) {
				this._value.push(item);
				this.emit('add', item);
				changed = true;
			}
		}
		defineProperty(this, 'count', d('c', value.length));
		return changed;
	}),
	values: d.gs(function () {
		return copy.call(this._value);
	})
});

ObjectList.defineOn(RelSet.prototype);
