'use strict';

var NumberType = require('../../types-base/number')
  , StringType = require('../../types-base/string')

  , ns;

module.exports = ns = NumberType.create('Currency', {
	symbol: StringType.required
}, {
	toString: function () {
		return this.ns.symbol + this.toFixed(2);
	}
});
