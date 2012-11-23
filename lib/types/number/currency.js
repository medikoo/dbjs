'use strict';

var number = require('../number')
  , string = require('../string')

  , ns;

module.exports = ns = number.create('currency', {
	symbol: string.required
}, {
	toString: function () {
		return this.ns.symbol + this.toFixed(2);
	}
});
