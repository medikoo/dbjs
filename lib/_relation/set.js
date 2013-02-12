'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , forEach     = require('es5-ext/lib/Object/for-each')
  , callable    = require('es5-ext/lib/Object/valid-callable')
  , unserialize = require('../utils/unserialize')
  , relation    = require('./')

  , isArray = Array.isArray, call = Function.prototype.call
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf

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
			((typeof this.__value !== 'function') ||
				(this.__value._type_ === 'namespace'));
	}),
	add: d(function (value) {
		var error;
		this._assertSet_();
		error = this.validateValue(value);
		if (error) throw error;
		return this.$add(value);
	}),
	$add: d(function (value) {
		var item, key, ns = this.__ns.__value;
		if (!ns.is(value)) value = ns.prototype.$create(value);
		key = ns._serialize_(value);
		item = this._getItem_(key, value);
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
		var key, ns;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}

		ns = this.__ns.__value;
		value = ns.normalize(value);
		if (value == null) return null;
		if (!(key = ns._serialize_(value))) return null;
		if (this.propertyIsEnumerable(key)) {
			if ((this._count_ === 1) && this.required &&
					this.hasOwnProperty('_value')) {
				return new TypeError('Cannot remove the only value');
			}
		}
		return null;
	}),
	$delete: d(function (value) {
		var item, key, ns;
		if (!arguments.length) return rel$delete.call(this);
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}

		ns = this.__ns.__value;
		value = ns.normalize(value);
		if (value == null) return null;
		key = ns._serialize_(value);
		if (!key) return null;
		item = this._getItem_(key, value);
		item._signal_(false);
		return item;
	}),
	has: d(function (value) {
		var key, ns;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return false;
		}
		ns = this.__ns.__value;
		value = ns.normalize(value);
		if (value == null) return false;

		key = ns._serialize_(value);
		if (key == null) return false;

		return this._has_(key);
	}),
	_has_: d(function (key) {
		var proto;
		if (this.hasOwnProperty(key)) return this[key].__value;
		if (this.hasOwnProperty('_value')) return false;
		proto = getPrototypeOf(this);
		while (proto) {
			if (!proto.__multiple.__value) return false;
			if (proto.hasOwnProperty(key)) return proto[key].__value;
			if (proto.hasOwnProperty('_value')) return false;
			proto = getPrototypeOf(proto);
		}
	}),
	forEach: d(function (cb/*, thisArg*/) {
		var thisArg, index, proto, ignores, iterate, ns;
		this._assertSet_();
		callable(cb);
		thisArg = arguments[1];
		index = -1;
		ignores = {};
		this._forEachItem_(function (item) {
			ignores[item._key_] = true;
			if (!item.__value) return;
			call.call(cb, thisArg, item._subject_, item, this, ++index, item._key_);
		}, this);
		if (!this.hasOwnProperty('_value')) {
			proto = getPrototypeOf(this);
			ns = this.__ns.__value;
			iterate = function (item) {
				if (ignores[item._key_]) return;
				ignores[item._key_] = true;
				if (!item.__value) return;
				if ((proto.__ns.__value !== ns) &&
						(ns.normalize(item._subject_) == null)) {
					return;
				}
				call.call(cb, thisArg, item._subject_, null, this, ++index, item._key_);
			};
			while (proto && (proto._type_ === 'relation')) {
				if (!proto.__multiple.__value) break;
				proto._forEachItem_(iterate, this);
				if (proto.hasOwnProperty('_value')) break;
				proto = getPrototypeOf(proto);
			}
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
		var key, ns;
		this._assertSet_();
		if ((value == null) || ((typeof value === 'function') && !value._id_)) {
			return null;
		}
		ns = this.__ns.__value;
		value = ns.normalize(value);
		if (value == null) return null;
		key = ns._serialize_(value);
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
		this._forEachItem_(function (item) { item.$delete(); });
	}),
	_reset_: d(function (value) {
		var key, ns, map, item, autoOrder;
		if ((value == null) || ((typeof value === 'function') && !value._type_)) {
			this._clear_();
			this._signal_(value);
			return;
		}
		autoOrder = (this._autoOrder_ !== false);
		if (isArray(value)) {
			if (!value.length) {
				this._clear_();
			} else {
				ns = this.__ns.__value;
				map = {};
				value.map(function (value, index) {
					if (!ns.is(value)) value = ns.prototype.$create(value);
					map[ns._serialize_(value)] = { value: value, index: index + 1 };
				}, this);
				this._forEachItem_(function (item) {
					if (!map[item._key_]) {
						item.$delete();
					} else {
						if (autoOrder) item._order._signal_(map[item._key_].index);
						item._signal_(true);
						delete map[item._key_];
					}
				});
				forEach(map, function (value, key) {
					var item = this._getItem_(key, value.value);
					item._signal_(true);
					if (autoOrder) item._order._signal_(value.index);
				}, this);
			}
		} else {
			key = this.__ns.__value._serialize_(value);
			this._forEachItem_(function (item) {
				if (item._key_ === key) return;
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
require('./set-list');
