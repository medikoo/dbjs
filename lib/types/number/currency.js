'use strict';

var NumberType = require('../number')
  , StringType = require('../string')

  , ns;

module.exports = ns = NumberType.create('Currency', {
	symbol: StringType.required
}, {
	toString: function () {
		return this.ns.symbol + this.toFixed(2);
	}
});
