'use strict';

var d = require('d/d')

  , defineProperties = Object.defineProperties;

module.exports = function (db, descriptor) {
	defineProperties(descriptor.$getOwn('required'), {
		type: d('', db.Boolean),
		_value_: d('w', false)
	});
};
