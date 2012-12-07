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
	_initSet_: d(function () {
		var value, key;
		defineProperty(this, '_count_', d(0));
		if (this.hasOwnProperty('_value') && (this._value != null) &&
				((typeof this._value !== 'function') || this._value._id_)) {
			value = this.ns.normalize(this._value);
			if (value == null) return;
			key = this.ns._serialize_(value);
			defineProperty(this, key, d('ce', new Item(this, key, this._value)));
			++this._count_;
		}
	}),
	count: d.gs(function () {
		var count;
		this._assertSet_();
		if (this.hasOwnProperty('_value')) return this._count_;
		count = 0;
		this.forEach(function () { ++count; });
		return count;
	}),
	_isSet_: d.gs(function () {
		return this.multiple &&
			((typeof this._value !== 'function') || this._value._id_) &&
			this.hasOwnProperty('_count_');
	}),
	_last_: d.gs(function () {
		if (!this._count_) return null;
		return this[last.call(keys(this))];
	}),
	_assertSet_: d(function () {
		if (!this._isSet_) throw new TypeError("Property is not a set");
	}),
	add: d(function (value) {
		var error = this.addValidate(value);
		if (error) throw error;
		if (!this.ns.is(value)) value = this.ns.$construct(value);
		return this.$add(value);
	}),
	$add: d(function (value) {
		var key = this.ns._serialize_(value);
		if (this.propertyIsEnumerable(key)) return value;
		if (this.hasOwnProperty(key)) {
			this[key]._value = value;
			defineProperty(this, key, d('ce', this[key]));
		} else {
			defineProperty(this, key, d('ce', new Item(this, key, value)));
		}
		if (this.hasOwnProperty('_value')) {
			if (this._value === null) this._onOld_(null);
			this._value = value;
		}
		++this._count_;
		this._onNew_(value);
		return value;
	}),
	$setItem: d(function (key) {
		if (this.hasOwnProperty(key)) return;
		defineProperty(this, key, d('c', new Item(this, key)));
	}),
	addValidate: d(function (value) {
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_) ||
				isArray(value)) {
			return new TypeError(value + " is not valid " + this.ns._id_);
		}
		return this._validate_(value);
	}),
	delete: d(function (value) {
		var key, isTopValue;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return;
		}

		value = this.ns.normalize(value);
		if (value == null) return;
		if (!(key = this.ns._serialize_(value))) return;

		if (this.propertyIsEnumerable(key)) {
			isTopValue = this.hasOwnProperty('_value') && (this._value === value);
			if (isTopValue && this._required && (this._count_ === 1)) {
				throw new TypeError('Cannot remove the only value');
			}
			--this._count_;
			defineProperty(this, key, d('c', this[key]));
			if (isTopValue) {
				this._value = this._last_._value;
				if (this._value === null) this._onNew_(null);
			}
			this._onOld_(value);
			return;
		}
		if (this.hasOwnProperty(key)) return;
		defineProperty(this, key, d('c', new Item(this, key)));
	}),
	has: d(function (value) {
		var key, proto;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return false;
		}
		value = this.ns.normalize(value);
		if (value == null) return false;

		key = this.ns._serialize_(value);
		if (key == null) return false;

		if (this.propertyIsEnumerable(key)) return true;
		if (this.hasOwnProperty(key) || this.hasOwnProperty('_value')) {
			return false;
		}
		if (this._value == null) return false;
		if (this._value === value) return true;
		proto = getPrototypeOf(this);
		while (proto) {
			if (!proto.multiple) return false;
			if (proto.hasOwnProperty('_count_')) return proto.has(value);
			if (proto.hasOwnProperty('_value')) return false;
			proto = getPrototypeOf(proto);
		}
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1], index = -1, proto
		  , ignores, iterate, setIgnore, value;
		this._assertSet_();
		callable(cb);
		forEach(this, function (value, name) {
			call.call(cb, thisArg, value.value, value, this, ++index);
		}, this, function (a, b) {
			return this[a].order - this[b].order;
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
			if (!proto.multiple) {
				if ((proto._value == null) ||
						ignores[proto.ns._serialize_(value = proto.value)]) {
					return;
				}
				call.call(cb, thisArg, value, null, this, ++index);
				return;
			}
			if (proto.hasOwnProperty('_count_')) keys(proto).forEach(iterate, this);
			if (proto.hasOwnProperty('_value')) return;
			getOwnPropertyNames(proto).forEach(setIgnore);
			proto = getPrototypeOf(proto);
		}
	}),
	getItemProperties: d(function (value) {
		var key;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}
		value = this.ns.normalize(value);
		if (value == null) return null;
		key = this.ns._serialize_(value);
		return this.propertyIsEnumerable(key) ? this[key] : null;
	}),
	values: d.gs(function () {
		var arr = [];
		this._assertSet_();
		this.forEach(function (item) { arr.push(item); });
		return arr;
	}),
	_clear_: d(function () {
		keys(this).forEach(function (name) {
			this._onOld_(this[name]._value);
			this[name]._value = null;
			defineProperty(this, name, d('c', this[name]));
		}, this);
		this._count_ = 0;
	}),
	_reset_: d(function (value) {
		var ns, key, map, last;
		if (value === undefined) {
			this._clear_();
			if (this.hasOwnProperty('_value')) {
				delete this._value;
				this._onNew_(undefined);
			}
			return;
		}

		if ((value === null) || ((typeof value === 'function') && !value._id_)) {
			this._clear_();
		} else if (this.multiple && isArray(value)) {
			if (!value.length) {
				this._clear_();
				value = null;
			} else {
				ns = this.ns;
				map = {};
				value.map(function (value, index) {
					if (!ns.is(value)) value = ns.$construct(value);
					last = map[ns._serialize_(value)] = { value: value, index: index };
				}, this);
				keys(this).forEach(function (key) {
					if (!map[key]) {
						this._onOld_(this[key]._value);
						this[key]._value = null;
						defineProperty(this, key, d('c', this[key]));
						--this._count_;
					} else {
						this[key].order = map[key].index;
						delete map[key];
					}
				}, this);
				forEach(map, function (value, key) {
					var item;
					if (this.hasOwnProperty(key)) {
						this[key]._value = value.value;
						this[key]._order.$setValue(value.index);
						defineProperty(this, key, d('ce', this[key]));
					} else {
						defineProperty(this, key, d('ce',
							item = new Item(this, key, value.value)));
						item.order = value.index;
					}
					++this._count_;
					this._onNew_(value.value);
				}, this);
				value = last;
			}
		} else {
			if (!this.ns.is(value)) value = this.ns.$construct(value);
			key = this.ns._serialize_(value);
			keys(this).forEach(function (lkey) {
				if (lkey !== key) {
					this._onOld_(this[lkey]._value);
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
					defineProperty(this, key, d('ce', new Item(this, key, value)));
				}
				this._onNew_(value);
			}
			this._count_ = 1;
		}

		if (!this.hasOwnProperty('_value')) this._onOld_(undefined);
		if (!this.hasOwnProperty('_value')) {
			defineProperty(this, '_value', d('cw', value));
		} else {
			this._value = value;
		}
	})
});
