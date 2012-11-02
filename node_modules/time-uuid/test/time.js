'use strict';

module.exports = function (t, a) {
	a(typeof t(), 'number', "Type");
	a.not(t(), t(), "Unique");
};
