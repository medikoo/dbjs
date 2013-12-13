'use strict';

module.exports = function (T, a) {
	var error = new T();
	a(error instanceof Error, true, "Error");
	a(error.name, 'DbjsError', "Name");
};
