'use strict';

var customError = require('es5-ext/error/custom')
  , d           = require('d/d')
  , ee          = require('event-emitter/lib/core')

  , ReadOnlySet = module.exports = function () {}
  , readOnly;

readOnly = function () {
	throw customError("Set is read-only", 'SET_READ_ONLY');
};

ee(Object.defineProperties(ReadOnlySet.prototype, {
	_isSet_: d(true),
	add: d(readOnly),
	delete: d(readOnly)
}));
