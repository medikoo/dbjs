'use strict';

var dbImport     = require('../_internals/signal-import')
  , messageSplit = require('./message-split');

module.exports = function (str, importId) {
	var data = messageSplit(str);
	data.push(importId);
	dbImport.apply(null, data);
};
