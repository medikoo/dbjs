'use strict';

module.exports = function (value) {
	return (value && value.__id && !value.__ns) || false;
};
