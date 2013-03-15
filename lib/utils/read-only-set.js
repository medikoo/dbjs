'use strict';

var CustomError = require('es5-ext/lib/Error/custom')
  , d           = require('es5-ext/lib/Object/descriptor')
  , ee          = require('event-emitter/lib/core')

  , ReadOnlySet = module.exports = function () {}
  , readOnly;

readOnly = function () {
	throw new CustomError("Set is read-only", 'SET_READ_ONLY');
};

ee(Object.defineProperties(ReadOnlySet.prototype, {
	_isSet_: d(true),
	add: d(readOnly),
	delete: d(readOnly)
}));
