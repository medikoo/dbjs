'use strict';

module.exports = function (a, b) {
	var item = this[a];
	a = (typeof item === 'number') ? item : item.lastModified;
	item = this[b];
	b = (typeof item === 'number') ? item : item.lastModified;
	return a - b;
};
