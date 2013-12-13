'use strict';

module.exports = function (a, b) {
	return this[a].lastModified - this[b].lastModified;
};
