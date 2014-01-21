'use strict';

var isNestedObject = require('./is-dbjs-nested-object');

module.exports = function (value/*, owner*/) {
	var owner = arguments[1];
	if (isNestedObject(value, owner)) return value;
	if (owner == null) throw new TypeError(value + " is not nested dbjs object");
	throw new TypeError(value + " is not nested dbjs object of " + owner);
};
