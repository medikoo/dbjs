'use strict';

var NumberType = require('../../types/number')
  , StringType = require('../../types/string')

  , ns;

module.exports = ns = NumberType.create('Currency', {
	step: 0.01,
	symbol: StringType.required
}, {
	toString: function () {
		return this.ns.symbol + this.toFixed(2);
	}
});
