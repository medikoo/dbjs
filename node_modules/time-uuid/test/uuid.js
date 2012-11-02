'use strict';

module.exports = function (t, a) {
	a(typeof t(), 'string', "Type");
	a.not(t(), t(), "Unique");
};
