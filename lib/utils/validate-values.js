'use strict';

module.exports = function (obj, values, validate, data) {
	var error, errors;
	values.forEach(function (value) {
		if ((error = validate.call(obj, value, data))) {
			if (!errors) errors = [];
			errors.push(error);
		}
	});
	if (!errors) return null;
	error = new TypeError("Invalid values");
	error.errors = errors;
	return error;
};
