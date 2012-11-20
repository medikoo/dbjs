'use strict';

var root     = require('./root')
  , Relation = require('../_internals/relation')

  , boolean;

module.exports = boolean = root.create('boolean', function (value) {
	return Boolean(value && value.valueOf());
}, {
	is: function (value) { return (typeof value === 'boolean'); },
	normalize: function (value) { return Boolean(value && value.valueOf()); }
});
