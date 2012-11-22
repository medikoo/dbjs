'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , root     = require('./root')

  , boolean;

module.exports = boolean = root.create('boolean', function (value) {
	return Boolean(value && value.valueOf());
}, {
	is: function (value) { return (typeof value === 'boolean'); },
	normalize: function (value) { return Boolean(value && value.valueOf()); }
});

Object.defineProperties(boolean, {
	coerce: d('c', boolean._normalize),
	__serialize: d('c', function (value) { return '0' + Number(value); })
});
