'use strict';

var validFunction = require('es5-ext/lib/Function/valid-function')
  , d             = require('es5-ext/lib/Object/descriptor')

  , defineProperty = Object.defineProperty;

module.exports = function (name) {
	name = '_' + name;
	return d.gs('c', function () {
		return this[name];
	}, function (fn) {
		validFunction(fn);
		defineProperty(this, name, d('c', fn));
	});
};
