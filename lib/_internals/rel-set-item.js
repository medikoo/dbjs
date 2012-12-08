'use strict';

var d           = require('es5-ext/lib/Object/descriptor')
  , Plain       = require('./plain')
  , define      = require('./define-basic')
  , unserialize = require('./unserialize')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , Item;

module.exports = Item = Plain.create(function (rel, key, value) {
	defineProperties(this, {
		obj: d('c', rel),
		_id_: d('c', rel._id_ + ':' + key + '"'),
		_key_: d('c', key),
		_value: d('w', value)
	});
});

Object.defineProperties(Item.prototype, {
	_id_: d('"'),
	value: d.gs(function () {
		var value = this._value;
		return (value == null) ? value : this.obj.ns.normalize(value);
	}),
	$setValue: d(function (value) {
		if (value) {
			if (this._value != null) return;
			this._value = unserialize(this._key_);
			defineProperty(this.obj, this._key_, d('ce', this));
		} else if (this._value != null) {
			this._value = null;
			defineProperty(this.obj, this._key_, d('c', this));
		}
	}),
	delete: d(function () {
		var isTopValue;
		this.obj._assertSet_();
		if (this._value == null) return;
		isTopValue = this.obj.hasOwnProperty('_value') &&
			(this._value === this.obj._value);
		if (isTopValue && this.obj.required && (this.obj._count_ === 1)) {
			throw new TypeError('Cannot remove the only value');
		}
		--this.obj._count_;
		defineProperty(this.obj, this._key_, d('c', this));
		if (isTopValue) this.obj._value = this.obj._last_._value;
		this.obj._onOld_(this._value);
		this._value = null;
	})
});

define(Item.prototype, 'order', 0);
Object.defineProperties(Item.prototype.__order, {
	_normalize: d(Number),
	validate: d(function (value) {
		if (isNaN(value)) return new TypeError(value + ' is not a number');
		return null;
	})
});
