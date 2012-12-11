'use strict';

var getValueEndIndex = require('../_internals/get-value-end-index')
  , dbImport         = require('../_internals/signal-import')

  , isItemId = RegExp.prototype.test.bind(/^[\0-\-\/-\uffff]*:\d/);

module.exports = function (str) {
	var data, i;

	data = str.split('.');
	data[1] = Number(data[1]);

	if (data.length === 4) {
		dbImport.apply(null, data);
		return;
	}

	str = str.slice(data[0].length + String(data[1]).length + 2);
	if (isItemId(str[0])) {
		// Set item property
		i = getValueEndIndex(str);
		dbImport(data[0], data[1], str.slice(0, i), str.slice(i + 2));
		return;
	}

	// '.' within value
	dbImport(data[0], data[1], data[2], str.slice(data[2].length + 1));
};
