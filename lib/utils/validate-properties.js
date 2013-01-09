'use strict';

var forEach = require('es5-ext/lib/Object/for-each');

module.exports = function (obj, values, validate) {
	var error, errors;
	forEach(values, function (value, name) {
		if ((error = validate.call(obj, name, value))) {
			if (!errors) errors = [];
			errors.push(error);
		}
	});
	if (!errors) return null;
	error = new TypeError("Invalid property values");
	error.errors = errors;
	return error;
};
