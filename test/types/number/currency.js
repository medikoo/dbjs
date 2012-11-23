'use strict';

module.exports = function (t, a) {
	var ns = t.create('currencyTest', { symbol: "TEST" })
	  , obj = Object(23);

	obj.__proto__ = ns.prototype;

	a(obj.toString(), 'TEST23.00');
};
