'use strict';

var d         = require('es5-ext/lib/Object/descriptor')
  , Plain     = require('./plain')
  , serialize = require('./serialize')

  , defineProperty = Object.defineProperty

  , Item;

module.exports = Item = Plain.create(function (rel, value) {
	defineProperty(this, 'rel', d('c', rel));
	defineProperty(this, '_value', d('w', value));
});

Object.defineProperties(Item.prototype, {
	value: d.gs(function () {
		var value = this._value;
		return (value == null) ? value : this.rel._ns._normalize(value);
	}),
	_order: d(0),
	order: d.gs(function () {
		return this._order;
	}, function (value) {
		if (isNaN(value)) throw new TypeError(value + ' is not a number');
		defineProperty(this, '_order', d('c', Number(value)));
	}),
	remove: d(function () {
		var isTopValue;
		this.rel.__assertSet();
		if (this._value == null) return;
		isTopValue = this.rel.hasOwnProperty('_value') &&
			(this._value === this.rel._value);
		if (isTopValue && this.rel._required && (this.rel.count === 1)) {
			throw new TypeError('Cannot remove the only value');
		}
		--this.rel.count;
		defineProperty(this.rel, serialize(this._value), d('c', this));
		if (isTopValue) this.rel._value = this.rel.__last._value;
		this.rel.__onOld(this._value);
		this._value = null;
	})
});
