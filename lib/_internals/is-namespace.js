'use strict';

module.exports = function (value) {
	return Boolean((typeof value === 'function') && value.__id);
};
