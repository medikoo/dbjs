'use strict';

var aFrom          = require('es5-ext/array/from')
  , identity       = require('es5-ext/function/identity')
  , isError        = require('es5-ext/error/is-error')
  , compose        = require('es5-ext/function/#/compose')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , DbjsError      = require('../_setup/error')
  , getMessage     = require('../_setup/utils/get-sub-error-message')

  , forEach = Array.prototype.forEach, map = Array.prototype.map, slice = Array.prototype.slice
  , bind = Function.prototype.bind;

module.exports = function (operation1/*, ...operationn*/) {
	var errors = [], previousResult = {}, operations = aFrom(arguments);
	if (isError(operations[0])) errors.push(operations.shift());
	forEach.call(operations, ensureCallable);

	if (operations.length === 1) operations.push(identity);
	var result = bind.apply(compose, map.call(operations, function (fn) {
		return function () {
			try {
				return (previousResult = (fn(previousResult) || previousResult));
			} catch (e) {
				if (e.name !== "DbjsError") throw e;
				errors.push(e);
			}
		};
	}).reverse())()();

	if (!errors.length) return result;

	throw new DbjsError("Invalid properties:\n\t" +
		errors.map(getMessage).join('\t\n'), 'SET_PROPERTIES_ERROR', { errors: errors });
};
