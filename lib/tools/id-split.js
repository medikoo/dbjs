'use strict';

var getValueEndIndex = require('../_internals/get-value-end-index')

  , isDigit = RegExp.prototype.test.bind(/\d/);

module.exports = function (id) {
	var iQ, iC, result;
	if ((iQ = id.indexOf('"')) === -1) return id.split(':');
	iC = id.indexOf(':');
	result = [];
	while (iC !== -1) {
		if (isDigit(id[0])) {
			iQ = getValueEndIndex(id);
			result.push(id.slice(0, iQ));
			id = id.slice(iQ + 2);
		} else {
			result.push(id.slice(0, iC));
			id = id.slice(iC + 1);
		}
		iC = id.indexOf(':');
	}
	if (id) result.push(id);
	return result;
};
