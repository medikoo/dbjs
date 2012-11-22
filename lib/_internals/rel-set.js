'use strict';

var last      = require('es5-ext/lib/Array/prototype/last')
  , d         = require('es5-ext/lib/Object/descriptor')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , Relation  = require('./relation')
  , Item      = require('./rel-set-item')

  , isArray = Array.isArray, call = Function.prototype.call
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys;

defineProperties(Relation.prototype, {
	__initSet: d(function () {
		var value;
		defineProperty(this, '__count', d(0));
		if (this.hasOwnProperty('_value') && (this._value != null) &&
				(typeof this._value !== 'function')) {
			value = this._ns._normalize(this._value);
			if (value == null) return;
			defineProperty(this, this._ns.__serialize(value),
				d('ce', new Item(this, this._value)));
			++this.__count;
		}
	}),
	count: d.gs(function () {
		var count;
		this.__assertSet();
		if (this.hasOwnProperty('_value')) return this.__count;
		count = 0;
		this.forEach(function () { ++count; });
		return count;
	}),
	__last: d.gs(function () {
		if (!this.__count) return null;
		return this[last.call(keys(this))];
	}),
	__assertSet: d(function () {
		if (!this._multiple || (typeof this._value === 'function') ||
				!this.hasOwnProperty('__count')) {
			throw new TypeError("Property is not a set");
		}
	}),
	add: d(function (value) {
		var key, error;
		this.__assertSet();
		if ((value == null) || (typeof value === 'function')) {
			throw new TypeError(value + " is not valid " + this._ns.__id);
		}
		if ((error = this.__validateValue(value))) throw error;
		value = this._ns(value);
		key = this._ns.__serialize(value);

		if (this.propertyIsEnumerable(key)) return value;
		if (this.hasOwnProperty(key)) {
			this[key]._value = value;
			defineProperty(this, key, d('ce', this[key]));
		} else {
			defineProperty(this, key, d('ce', new Item(this, value)));
		}
		if (this.hasOwnProperty('_value')) {
			if (this._value === null) this.__onOld(null);
			this._value = value;
		}
		++this.__count;
		this.__onNew(value);
		return value;
	}),
	remove: d(function (value) {
		var key, isTopValue;
		this.__assertSet();
		if ((value == null) || (typeof value === 'function')) return;

		value = this._ns._normalize(value);
		if (value == null) return;
		if (!(key = this._ns.__serialize(value))) return;

		if (this.propertyIsEnumerable(key)) {
			isTopValue = this.hasOwnProperty('_value') && (this._value === value);
			if (isTopValue && this._required && (this.__count === 1)) {
				throw new TypeError('Cannot remove the only value');
			}
			--this.__count;
			defineProperty(this, key, d('c', this[key]));
			if (isTopValue) {
				this._value = this.__last._value;
				if (this._value === null) this.__onNew(null);
			}
			this.__onOld(value);
			return;
		}
		if (this.hasOwnProperty(key)) return;
		defineProperty(this, key, d('c', new Item(this)));
	}),
	has: d(function (value) {
		var key, proto;
		this.__assertSet();
		if ((value == null) || (typeof value === 'function')) return false;
		value = this._ns._normalize(value);
		if (value == null) return false;

		key = this._ns.__serialize(value);
		if (key == null) return false;

		if (this.propertyIsEnumerable(key)) return true;
		if (this.hasOwnProperty(key) || this.hasOwnProperty('_value')) {
			return false;
		}
		if (this._value == null) return false;
		if (this._value === value) return true;
		proto = getPrototypeOf(this);
		while (proto) {
			if (!proto._multiple) return false;
			if (proto.hasOwnProperty('__count')) return proto.has(value);
			if (proto.hasOwnProperty('_value')) return false;
			proto = getPrototypeOf(proto);
		}
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1], index = -1, proto
		  , ignores, iterate, setIgnore, value;
		this.__assertSet();
		callable(cb);
		forEach(this, function (value) {
			call.call(cb, thisArg, value.value, value, this, ++index);
		}, this, function (a, b) {
			return this[a]._order - this[b]._order;
		});

		if (this.hasOwnProperty('_value')) return;
		ignores = {};
		getOwnPropertyNames(this)
			.forEach(setIgnore = function (key) { ignores[key] = true; });
		proto = getPrototypeOf(this);
		iterate = function (key) {
			if (!ignores[key]) {
				call.call(cb, thisArg, proto[key].value, null, this, ++index);
			}
		};
		while (proto) {
			if (!proto._multiple) {
				if ((proto._value == null) ||
						ignores[proto._ns.__serialize(value = proto.value)]) {
					return;
				}
				call.call(cb, thisArg, value, null, this, ++index);
				return;
			}
			if (proto.hasOwnProperty('__count')) keys(proto).forEach(iterate, this);
			if (proto.hasOwnProperty('_value')) return;
			getOwnPropertyNames(proto).forEach(setIgnore);
			proto = getPrototypeOf(proto);
		}
	}),
	getItemProperties: d(function (value) {
		var key;
		this.__assertSet();
		if ((value == null) || (typeof value === 'function')) return null;
		value = this._ns.normalize(value);
		if (value == null) return null;
		key = this._ns.__serialize(value);
		return this.propertyIsEnumerable(key) ? this[key] : null;
	}),
	values: d.gs(function () {
		var arr = [];
		this.__assertSet();
		this.forEach(function (item) { arr.push(item); });
		return arr;
	}),
	__clear: d(function () {
		keys(this).forEach(function (name) {
			this.__onOld(this[name]._value);
			this[name]._value = null;
			defineProperty(this, name, d('c', this[name]));
		}, this);
		this.__count = 0;
	}),
	__reset: d(function (value) {
		var ns, key, map, last;
		if (value === undefined) {
			this.__clear();
			if (this.hasOwnProperty('_value')) {
				delete this._value;
				this.__onNew(undefined);
			}
			return;
		}

		if ((value === null) || (typeof value === 'function')) {
			this.__clear();
		} else if (this._multiple && isArray(value)) {
			if (!value.length) {
				this.__clear();
				value = null;
			} else {
				ns = this._ns;
				map = {};
				value.map(function (value, index) {
					value = ns(value);
					last = map[ns.__serialize(value)] = { value: value, index: index };
				}, this);
				keys(this).forEach(function (key) {
					if (!map[key]) {
						this.__onOld(this[key]._value);
						this[key]._value = null;
						defineProperty(this, key, d('c', this[key]));
						--this.__count;
					} else {
						this[key].order = map[key].index;
						delete map[key];
					}
				}, this);
				forEach(map, function (value, key) {
					var item;
					if (this.hasOwnProperty(key)) {
						this[key]._value = value.value;
						this[key].order = value.index;
						defineProperty(this, key, d('ce', this[key]));
					} else {
						defineProperty(this, key, d('ce',
							item = new Item(this, value.value)));
						item.order = value.index;
					}
					++this.__count;
					this.__onNew(value.value);
				}, this);
				value = last;
			}
		} else {
			value = this._ns(value);
			key = this._ns.__serialize(value);
			keys(this).forEach(function (lkey) {
				if (lkey !== key) {
					this.__onOld(this[lkey]._value);
					this[lkey]._value = null;
					defineProperty(this, lkey, d('c', this[lkey]));
				} else {
					key = null;
				}
			}, this);
			if (key) {
				if (this.hasOwnProperty(key)) {
					this[key]._value = value;
					defineProperty(this, key, d('ce', this[key]));
				} else {
					defineProperty(this, key, d('ce', new Item(this, value)));
				}
				this.__onNew(value);
			}
			this.__count = 1;
		}

		if (!this.hasOwnProperty('_value')) this.__onOld(undefined);
		if (!this.hasOwnProperty('_value')) {
			defineProperty(this, '_value', d('cw', value));
		} else {
			this._value = value;
		}
	})
});
