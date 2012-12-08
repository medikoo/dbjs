'use strict';

var i         = require('es5-ext/lib/Function/i')
  , k         = require('es5-ext/lib/Function/k')
  , serialize = require('./serialize');

module.exports = { is: k(true), normalize: i, validate: k(null),
	_serialize_: serialize, coerce: i, $construct: i };
