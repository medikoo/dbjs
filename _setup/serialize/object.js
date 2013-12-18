'use strict';

module.exports = function (value) {
	if (!value) return null;
	if (!value.__id__) return null;
	return value.__id__;
};
