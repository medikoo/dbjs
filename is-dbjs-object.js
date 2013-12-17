'use strict';

var kinds = require('es5-ext/object/primitive-set')('object', 'descriptor',
	'sub-descriptor', 'item')

  , hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function (value) {
	return (value && hasOwnProperty.call(value, '__id__') &&
			kinds[value._kind_]) || false;
};
