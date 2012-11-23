'use strict';

module.exports = function (t, a) {
	var obj = Object(23);

	obj.__proto__ = t.prototype;

	a(obj.toString(), '$23.00');
};
