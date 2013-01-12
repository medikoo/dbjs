'use strict';

var last      = require('es5-ext/lib/Array/prototype/last')
  , d         = require('es5-ext/lib/Object/descriptor')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , callable  = require('es5-ext/lib/Object/valid-callable')
  , serialize = require('../utils/serialize')
  , relation  = require('./')

  , isArray = Array.isArray, call = Function.prototype.call
  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys;

defineProperties(relation, {
	_assertSet_: d(function () {
		if (!this._isSet_) throw new TypeError("Property is not a set");
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
			((typeof this.__value !== 'function') || this.__value._id_);
	}),
	add: d(function (value) {
		var error;
		this._assertSet_();
		error = this.validateValue(value);
		if (error) throw error;
		return this.$add(value);
	}),
	$add: d(function (value) {
		var item;
		if (!this.ns.is(value)) value = this.ns.prototype.$create(value);
		item = this.$$add(value);
		item._signal_(true);
		return item;
	}),
	$$add: d(function (value) {
		var key, item;
		key = serialize(value);
		if (!this.propertyIsEnumerable(key)) {
			item = this.hasOwnProperty(key) ? this[key] :
					this._setItem_.$$create(this, key);
			item._value = value;
			defineProperty(this, key, d('ce', item));
			++this._count_;
			this.emit('add', value, item);
		} else {
			item = this[key];
		}
		this._lastValue_ = value;
		return item;
	}),
	_getSetItem_: d(function (key) {
		if (!this.hasOwnProperty(key)) {
			defineProperty(this, key, d('c', this._setItem_.$$create(this, key)));
		}
		return this[key];
	}),
	delete: d(function (value) {
		var error;
		if ((error = this.validateDelete(value))) throw error;
		return this.$delete(value);
	}),
	validateDelete: d(function (value) {
		var key;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}

		value = this.ns.normalize(value);
		if (value == null) return null;
		if (!(key = this.ns._serialize_(value))) return null;
		if (this.propertyIsEnumerable(key)) {
			if ((this._count_ === 1) && this.required &&
					this.hasOwnProperty('_value')) {
				return new TypeError('Cannot remove the only value');
			}
		}
		return null;
	}),
	$delete: d(function (value) {
		var item;
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}

		value = this.ns.normalize(value);
		if (value == null) return null;
		item = this.$$delete(value);
		item._signal_();
		return item;
	}),
	$$delete: d(function (value) {
		var key = serialize(value), item, lastValue;
		if (this.propertyIsEnumerable(key)) {
			item = this[key];
			item._value = null;
			--this._count_;
			defineProperty(this, key, d('c', item));
			this.emit('delete', value, item);
		} else if (!this.hasOwnProperty(key)) {
			item = this._setItem_.$$create(this, key);
			defineProperty(this, key, d('c', item));
		} else {
			item = this[key];
		}
		if (value === this._lastValue_) {
			lastValue = this[last.call(keys(this))];
			this._lastValue_ = (lastValue && lastValue.value) || null;
		}
		return item;
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
		  , ignores, iterate, setIgnore;
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
			if (!proto.multiple) return;
			if (proto._count_) keys(proto).forEach(iterate, this);
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
		if (key == null) return null;
		return this.propertyIsEnumerable(key) ? this[key] : null;
	}),
	values: d.gs(function () {
		var arr;
		this._assertSet_();
		arr = [];
		this.forEach(function (item) { arr.push(item); });
		return arr;
	}),
	_clear_: d(function () {
		if (!this._count_) return;
		keys(this).forEach(function (key) {
			var item = this[key];
			item._order.$$setValue(undefined);
			item._order._signal_();
			this.$$delete(item._value);
			item._signal_();
		}, this);
	}),
	_reset_: d(function (value) {
		var key, ns, map, item;
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			this._clear_();
			this.$$setValue(value);
			this._signal_(value);
			return;
		}
		if (isArray(value)) {
			if (!value.length) {
				this._clear_();
			} else {
				ns = this.ns;
				map = {};
				value.map(function (value, index) {
					if (!ns.is(value)) value = ns.prototype.$create(value);
					map[ns._serialize_(value)] = { value: value, index: index };
				}, this);
				keys(this).forEach(function (key) {
					var item = this[key];
					if (!map[key]) {
						item._order.$$setValue(undefined);
						item._order._signal_();
						this.$$delete(item._value);
						item._signal_();
					} else {
						item._order.$$setValue(map[key].index);
						item._order._signal_(map[key].index);
						item._signal_(true);
						delete map[key];
					}
				}, this);
				forEach(map, function (value, key) {
					var item = this.$$add(value.value);
					item._signal_(true);
					item._order.$$setValue(value.index);
					item._order._signal_(value.index);
				}, this);
			}
		} else {
			key = this.ns._serialize_(value);
			keys(this).forEach(function (lkey) {
				var item = this[lkey];
				if (lkey === key) return;
				item._order.$$setValue(undefined);
				item._order._signal_();
				this.$$delete(item._value);
				item._signal_();
			}, this);
			item = this.$$add(value);
			item._signal_(true);
			item._order.$$setValue(1);
			item._order._signal_(1);
		}
		this.$$setValue(null);
		this._signal_(null);
	})
});

require('./set-item');
