'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , callable    = require('es5-ext/lib/Object/valid-callable')
  , unserialize = require('../utils/unserialize')
  , relation    = require('./')

  , isArray = Array.isArray, call = Function.prototype.call
  , defineProperties = Object.defineProperties
  , getOwnPropertyNames = Object.getOwnPropertyNames
  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys

  , relDelete = relation.delete, rel$delete = relation.$delete;

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
		return this.__multiple.__value &&
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
		var item, key;
		if (!this.ns.is(value)) value = this.ns.prototype.$create(value);
		key = this.ns._serialize_(value);
		item = this.hasOwnProperty(key) ? this[key] :
				this._itemPrototype_.$$createItem(key, value);
		item._signal_(true);
		return item;
	}),
	delete: d(function (value) {
		var error;
		if (!arguments.length) return relDelete.call(this);
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
		var item, key, defined;
		if (!arguments.length) return rel$delete.call(this);
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}

		value = this.ns.normalize(value);
		if (value == null) return null;
		key = this.ns._serialize_(value);
		if (!key) return null;
		item = this._getItem_(key, value);
		defined = this.propertyIsEnumerable(key);
		item.$delete();
		if (!defined) item._signal_();
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
			if (!proto.__multiple.__value) return false;
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
			return this[a].__order.__value - this[b].__order.__value;
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
			if (!proto.__multiple.__value) return;
			if (proto._count_) keys(proto).forEach(iterate, this);
			if (proto.hasOwnProperty('_value')) return;
			getOwnPropertyNames(proto).forEach(setIgnore);
			proto = getPrototypeOf(proto);
		}
	}),
	_getItem_: d(function (key, value) {
		if (!this.hasOwnProperty(key)) {
			if (value == null) value = unserialize(key);
			return this._itemPrototype_.$$createItem(key, value);
		}
		return this[key];
	}),
	getItem: d(function (value) {
		var key;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}
		value = this.ns.normalize(value);
		if (value == null) return null;
		key = this.ns._serialize_(value);
		if (key == null) return null;
		return this._getItem_(key, value);
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
			item.$delete();
		}, this);
	}),
	_reset_: d(function (value) {
		var key, ns, map, item, autoOrder;
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			this._clear_();
			this._signal_(value);
			return;
		}
		autoOrder = (this._autoOrder_ !== false);
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
						item.$delete();
					} else {
						if (autoOrder) item._order._signal_(map[key].index);
						item._signal_(true);
						delete map[key];
					}
				}, this);
				forEach(map, function (value, key) {
					var item = this._getItem_(key, value.value);
					if (autoOrder) item._order._signal_(value.index);
					item._signal_(true);
				}, this);
			}
		} else {
			key = this.ns._serialize_(value);
			keys(this).forEach(function (lkey) {
				var item = this[lkey];
				if (lkey === key) return;
				item.$delete();
			}, this);
			item = this._getItem_(key, value);
			item._signal_(true);
			if (autoOrder) item._order._signal_(1);
		}
		this._signal_(null);
	})
});

require('./set-item');
