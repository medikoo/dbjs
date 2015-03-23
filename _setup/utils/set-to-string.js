'use strict';

module.exports = function (/*separator*/) {
	var data = [], sep = arguments[0];
	if (sep === undefined) sep = ", ";
	this.forEach(function (value) { data.push(String(value)); });
	return data.join(sep);
};
