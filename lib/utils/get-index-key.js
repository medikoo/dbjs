'use strict';

var serialize = require('./serialize');

module.exports = function (value) {
	if (value == null) return null;
	if ((typeof value === 'function') && (value._type_ !== 'namespace')) {
		return null;
	}
	return serialize(value);
};
