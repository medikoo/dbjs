'use strict';

var toArray = require('es6-iterator/to-array');

module.exports = function (T, a) {
	var set = new T(['foo', 'bar']);

	a(set.size, 2, "Size");
	a(set.has('foo'), true, "Has");
	a.deep(toArray(set.copy()), ['foo', 'bar'], "Copy");
};
