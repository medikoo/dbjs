'use strict';

var isError = require('es5-ext/error/is-error');

module.exports = function (x) {
	return (isError(x) && x.name && x.name === 'DbjsError');
};
