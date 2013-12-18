'use strict';

var isDbjs = require('./is-dbjs');

module.exports = function (value) {
	if (isDbjs(value)) return value;
	throw new TypeError(value + " is not dbjs database");
};
