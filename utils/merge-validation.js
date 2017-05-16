'use strict';

var compose        = require('es5-ext/function/#/compose')
  , ensureCallable = require('es5-ext/object/valid-callable')
  , DbjsError      = require('../_setup/error')
  , getMessage     = require('../_setup/utils/get-sub-error-message')

  , forEach = Array.prototype.forEach
  , map = Array.prototype.map
  , bind = Function.prototype.bind;

module.exports = function (operation1/*, ...operationn*/) {
	var errors = [], previousResult = {};
	forEach.call(arguments, ensureCallable);

	var result = bind.apply(compose, map.call(arguments, function (fn) {
		return function () {
			try {
				return (previousResult = (fn(previousResult) || previousResult));
			} catch (e) {
				errors.push(e);
			}
		};
	}).reverse())()();
	if (!errors.length) return result;

	throw new DbjsError("Invalid properties:\n\t" +
		errors.map(getMessage).join('\t\n'), 'SET_PROPERTIES_ERROR', { errors: errors });
};
