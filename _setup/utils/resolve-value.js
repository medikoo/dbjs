'use strict';

var observePass = require('./observe-pass-through');

module.exports = function (obj, value, isGet, type, desc) {
	if (isGet) {
		value = value.call(obj, observePass);
		if (value == null) return null;
	}
	if (value == null) return value;
	return type.normalize(value, desc);
};
