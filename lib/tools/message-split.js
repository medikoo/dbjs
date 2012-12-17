'use strict';

var getValueEndIndex = require('../_internals/get-value-end-index')

  , isItemId = RegExp.prototype.test.bind(/^[\0-\-\/-\uffff]*:\d/);

module.exports = function (msg) {
	var data, i;

	data = msg.split('.');
	data[1] = Number(data[1]);

	if (data.length === 4) return data;

	msg = msg.slice(data[0].length + String(data[1]).length + 2);
	if (isItemId(msg[0])) {
		// Set item property
		i = getValueEndIndex(msg);
		return [data[0], data[1], msg.slice(0, i), msg.slice(i + 2)];
	}

	// '.' within value
	return [data[0], data[1], data[2], msg.slice(data[2].length + 1)];
};
