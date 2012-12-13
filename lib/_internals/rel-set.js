'use strict';

var last      = require('es5-ext/lib/Array/prototype/last')
  , d         = require('es5-ext/lib/Object/descriptor')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , Relation  = require('./relation')
  , Item      = require('./rel-set-item')
  , serialize = require('./serialize')
  , signal    = require('./signal')

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
			value = this._value;
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
		var key = serialize(value), item;
		if (!this.propertyIsEnumerable(key)) {
			if (this.hasOwnProperty(key)) {
				item = this[key];
				item._value = value;
				defineProperty(this, key, d('ce', item));
			} else {
				item = new Item(this, key, value);
				defineProperty(this, key, d('ce', item));
			}
			if (this.hasOwnProperty('_value')) {
				if (this._value === null) this._onOld_(null);
				this._value = value;
			}
			++this._count_;
			this._onNew_(value);
			this.emit('add', value, item);
		} else {
			item = this[key];
		}
		signal(item, true);
		return item;
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
		var key, isTopValue, item;
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
			item = this[key];
			item._value = null;
			--this._count_;
			defineProperty(this, key, d('c', item));
			if (isTopValue) {
				this._value = this._last_._value;
				if (this._value === null) this._onNew_(null);
			}
			this._onOld_(value);
			this.emit('delete', value, item);
		} else if (!this.hasOwnProperty(key)) {
			item = new Item(this, key);
			defineProperty(this, key, d('c', item));
		} else {
			item = this[key];
		}
		signal(item);
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
	get: d(function (value) {
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
		keys(this).forEach(function (key) {
			var item = this[key], value;
			this._onOld_(value = item._value);
			item._value = null;
			defineProperty(this, key, d('c', item));
			signal(item._order);
			signal(item);
			this.emit('delete', value, item);
		}, this);
		this._count_ = 0;
	}),
	_reset_: d(function (value) {
		var key, ns, map, signalled, item;
		if (!this.hasOwnProperty('_descriptor_')) this._setVisibility_(value);

		if (value === undefined) {
			this._clear_();
			if (this.hasOwnProperty('_value')) {
				delete this._value;
				this._onNew_(undefined);
			}
			signal(this);
			return;
		}
		if ((value === null) || ((typeof value === 'function') && !value._id_)) {
			this._clear_();
		} else if (isArray(value)) {
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
					var item = this[key], value;
					if (!map[key]) {
						this._onOld_(value = item._value);
						item._value = null;
						defineProperty(this, key, d('c', this[key]));
						--this._count_;
						signal(item);
						signal(item._order);
						this.emit('delete', value, item);
					} else {
						signal(item, true);
						item._order.$setValue(map[key].index);
						signal(item._order, map[key].index);
						delete map[key];
					}
				}, this);
				forEach(map, function (value, key) {
					var item = this.hasOwnProperty(key) && this[key];
					if (!item) {
						defineProperty(this, key, d('ce',
							item = new Item(this, key, value.value)));
					} else {
						defineProperty(this, key, d('ce', item));
					}
					item._value = value.value;
					++this._count_;
					this._onNew_(value.value);
					item._order.$setValue(value.index);
					signal(item, true);
					signal(item._order, value.index);
					this.emit('add', value.value, item);
				}, this);
				value = last;
			}
			signalled = true;
		} else {
			key = serialize(value);
			keys(this).forEach(function (lkey) {
				var item = this[lkey], value;
				if (lkey !== key) {
					this._onOld_(value = item._value);
					item._value = null;
					defineProperty(this, lkey, d('c', item));
					signal(item);
					signal(item._order);
					this.emit('remove', value, item);
				} else {
					key = null;
				}
			}, this);
			if (key) {
				if (this.hasOwnProperty(key)) {
					item = this[key];
					item._value = value;
					defineProperty(this, key, d('ce', item));
				} else {
					item = new Item(this, key, value);
					defineProperty(this, key, d('ce', item));
				}
				this._onNew_(value);
				this.emit('add', value, item);
			} else {
				item = this[key];
			}
			this._count_ = 1;
			signal(item, true);
			signalled = true;
		}

		if (!this.hasOwnProperty('_value')) this._onOld_(undefined);
		if (!this.hasOwnProperty('_value')) {
			defineProperty(this, '_value', d('cw', value));
		} else {
			this._value = value;
		}
		if (!signalled) signal(this, value);
	})
});
