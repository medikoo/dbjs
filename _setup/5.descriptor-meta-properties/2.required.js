'use strict';

var d = require('d/d')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

module.exports = function (db, descriptor) {
	defineProperties(descriptor.$getOwn('required'), {
		type: d('e', db.Boolean),
		_value_: d('w', false)
	});
	defineProperty(descriptor, 'required', descriptor._accessors_.required);
};
