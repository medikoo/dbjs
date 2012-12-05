'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , Plain     = require('./plain')
  , serialize = require('./serialize')
  , define    = require('./define-basic')

  , defineProperty = Object.defineProperty

  , Item;

module.exports = Item = Plain.create(function (rel, value) {
	defineProperty(this, 'rel', d('c', rel));
	defineProperty(this, '_value', d('w', value));
});

Object.defineProperties(Item.prototype, {
	value: d.gs(function () {
		var value = this._value;
		return (value == null) ? value : this.rel.ns.normalize(value);
	}),
	delete: d(function () {
		var isTopValue;
		this.rel._assertSet_();
		if (this._value == null) return;
		isTopValue = this.rel.hasOwnProperty('_value') &&
			(this._value === this.rel._value);
		if (isTopValue && this.rel.required && (this.rel._count_ === 1)) {
			throw new TypeError('Cannot remove the only value');
		}
		--this.rel._count_;
		defineProperty(this.rel, serialize(this._value), d('c', this));
		if (isTopValue) this.rel._value = this.rel._last_._value;
		this.rel._onOld_(this._value);
		this._value = null;
	})
});

define(Item.prototype, 'order', 0);
Object.defineProperties(Item.prototype.__order, {
	_normalize: d(function self(value) {
		return (value === undefined) ? value : Number(value);
	}),
	validate: d(function (value) {
		if (isNaN(value)) return new TypeError(value + ' is not a number');
		return null;
	})
});
