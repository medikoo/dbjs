'use strict';

var d     = require('es5-ext/lib/Object/descriptor')
  , Plain = require('./plain')

  , defineProperty = Object.defineProperty

  , Item;

module.exports = Item = Plain.create(function (rel, value) {
	defineProperty(this, 'rel', d('c', rel));
	defineProperty(this, '_value', d('w', value));
});

Object.defineProperties(Item.prototype, {
	value: d.gs('c', function () {
		var value = this._value;
		return (value == null) ? value : this.rel._ns._normalize(value);
	})
});
