'use strict';

var forEach = Array.prototype.forEach, push = Array.prototype.push;

module.exports = function (error) {
	var combined;
	forEach.call(arguments, function (error) {
		if (!error) return;
		if (!combined) {
			combined = new Error();
			combined.errors = [];
		}
		push.apply(combined.errors, error.errors);
	});
	return combined;
};
