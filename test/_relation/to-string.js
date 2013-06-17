'use strict';

var Db = require('../../');

module.exports = function (a) {
	var obj = new Db({
		toString: function () { return this.toStringTest + 'bar'; },
		toStringTest: 'foo'
	});
	a(String(obj), 'foobar');
};
