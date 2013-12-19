'use strict';

module.exports = function (error) {
	if (error.key == null) return error.message;
	return error.key + ': ' + error.message;
};
