'use strict';

var last      = require('es5-ext/lib/Array/prototype/last')
  , d         = require('es5-ext/lib/Object/descriptor')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , serialize = require('./serialize')
  , Item      = require('./rel-set-item')

  , isArray = Array.isArray
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys

  , RelationSet, getKey;

getKey = function (value) { return ':' + serialize(value); };

module.exports = RelationSet = function (rel) {
	defineProperties(this, {
		rel: d(rel),
		__count: d(0)
	});
	if (rel.hasOwnProperty('_value') && (rel._value != null)) {
		defineProperty(this, getKey(rel._value), d('ce', rel._value));
		++this.__count;
	}
};

defineProperties(RelationSet.prototype, {
	last: d.gs(function () {
		if (!this.__count) return null;
		return this[last.call(keys(this))];
	}),
	add: d(function (value) {
		var key, ns;
		if (value == null) throw new TypeError(value + " is not a value");
		if ((ns = this.rel.ns)) value = ns(value);
		if (this.rel.validate) value = this.rel.validate(value);

		key = getKey(value);
		if (this.propertyIsEnumerable(key)) return value;
		if (this.hasOwnProperty(key)) {
			this[key]._value = value;
			defineProperty(this, key, d('ce', this[key]));
		} else {
			defineProperty(this, key, d('ce', new Item(this.rel, value)));
		}
		if (this.rel.hasOwnProperty('_value')) this.rel._value = value;
		++this.__count;
		return value;
	}),
	remove: d(function (value) {
		var key, ns, isTopValue;
		if (value == null) return;
		if ((ns = this.rel.ns)) value = ns(value);
		if (this.rel.validate) value = this.rel.validate(value);

		key = getKey(value);
		if (this.propertyIsEnumerable(key)) {
			isTopValue = this.rel.hasOwnProperty('_value') &&
					(this.rel._value === value);
			if (isTopValue && this.rel.required && (this.__count === 1)) {
				throw new TypeError('Cannot remove the only value');
			}
			--this.__count;
			defineProperty(this, key, d('c', this[key]));
			if (isTopValue) this.rel._value = this.last._value;
			return;
		}
		if (this.hasOwnProperty(key)) return;
		defineProperty(this, key, d('c', new Item(this.rel)));
	}),
	has: d(function (value) {
		var key, ns, proto;
		if (value == null) return false;
		try {
			if ((ns = this.rel.ns)) value = ns(value);
			if (this.rel.validate) value = this.rel.validate(value);
		} catch (e) {
			return false;
		}
		key = getKey(value);

		if (this.propertyIsEnumerable(key)) return true;
		if (this.hasOwnProperty(key) || this.rel.hasOwnProperty('_value')) {
			return false;
		}
		if (this.rel._value == null) return false;
		if (this.rel._value === value) return true;
		proto = getPrototypeOf(this.rel);
		while (proto) {
			if (!proto.multiple) return false;
			if (proto.hasOwnProperty('__set')) return proto.__set.has(value);
			if (proto.hasOwnProperty('_value')) return false;
			proto = getPrototypeOf(proto);
		}
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1], index = -1, proto
		  , ignores, iterate, setIgnore, value;
		callable(cb);
		keys(this).forEach(function (key) {
			cb.call(thisArg, this[key].value, this[key], this, ++index);
		}, this);

		if (this.rel.hasOwnProperty('_value')) return;
		ignores = {};
		getOwnPropertyNames(this)
			.forEach(setIgnore = function (key) { ignores[key] = true; });
		proto = getPrototypeOf(this.rel);
		iterate = function (key) {
			if (!ignores[key]) {
				cb.call(thisArg, proto.__set[key].value, null, this, ++index);
			}
		};
		while (proto) {
			if (!proto.multiple) {
				if ((proto._value == null) || ignores[getKey(value = proto.value)]) {
					return;
				}
				cb.call(thisArg, value, null, this, ++index);
				return;
			}
			if (proto.hasOwnProperty('__set')) {
				keys(proto.__set).forEach(iterate, this);
			}
			if (proto.hasOwnProperty('_value')) return;
			getOwnPropertyNames(proto.__set).forEach(setIgnore);
			proto = getPrototypeOf(proto);
		}
	}),
	getItemProperties: d(function (value) {
		var key, ns;
		if (value == null) return null;
		try {
			if ((ns = this.rel.ns)) value = ns(value);
			if (this.rel.validate) value = this.rel.validate(value);
		} catch (e) {
			return null;
		}
		key = getKey(value);
		return this.propertyIsEnumerable(key) ? this[key] : null;
	}),
	toArray: d(function () {
		var arr = [];
		this.forEach(function (item) { arr.push(item); });
		return arr;
	}),
	_clear: d(function () {
		keys(this).forEach(function (name) {
			this[name]._value = null;
			defineProperty(this, name, d('c', this[name]));
		}, this);
		this.__count = 0;
	}),
	_reset: d(function (value) {
		var ns, validate, key, map, last;
		if (this.rel.multiple && isArray(value)) {
			if (!value.length) {
				if (this.rel.required) {
					if (this.rel.hasOwnProperty('_value') && (this.rel._value === null)) {
						// No change
						return;
					}
					throw new TypeError("Set can't be empty");
				}
				this._clear();
				this.rel._value = null;
				return;
			}
			ns = this.rel.ns;
			validate = this.rel.validate;
			map = {};
			value.map(function (value) {
				if (ns) value = ns(value);
				if (validate) validate.call(this.rel, value);
				last = map[getKey(value)] = value;
			}, this);
			keys(this).forEach(function (key) {
				if (!map[key]) {
					this[key]._value = null;
					defineProperty(this, key, d('c', this[key]));
					--this.__count;
				} else {
					delete map[key];
				}
			}, this);
			forEach(map, function (value, key) {
				if (this.hasOwnProperty(key)) {
					this[key]._value = value;
					defineProperty(this, key, d('ce', this[key]));
				} else {
					defineProperty(this, key, d('ce', new Item(this.rel, value)));
				}
				++this.__count;
			}, this);
			this.rel._value = last;
			return;
		}
		if ((ns = this._ns)) (value = ns(value));
		if ((validate = this.validate)) (value = validate.call(this, value));
		key = getKey(value);
		keys(this).forEach(function (lkey) {
			if (lkey !== key) {
				this[lkey]._value = null;
				defineProperty(this, lkey, d('c', this[lkey]));
			} else {
				key = null;
			}
		}, this);
		if (this.hasOwnProperty(key)) {
			this[key]._value = value;
			defineProperty(this, key, d('ce', this[key]));
		} else {
			defineProperty(this, key, d('ce', new Item(this.rel, value)));
		}
		this.rel._value = value;
		this.__count = 1;
	})
});
