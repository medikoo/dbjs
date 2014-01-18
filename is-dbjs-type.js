'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function (value) {
	return ((typeof value === 'function') &&
		hasOwnProperty.call(value, '__id__') &&
		(value._kind_ === 'object')) || false;
};
