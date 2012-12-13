'use strict';

var d             = require('es5-ext/lib/Object/descriptor')
  , callable      = require('es5-ext/lib/Object/valid-callable')
  , SetCollection = require('set-collection')

  , defineProperty = Object.defineProperty

  , Db;

// Import base types
require('./types-base/boolean');
require('./types-base/date-time');
require('./types-base/number');
require('./types-base/reg-exp');
require('./types-base/string');

// Export as object namespace
Db = module.exports = require('./types-base/object');

// Basic Set implementation for internal calculations
defineProperty(Db, 'Set', d('c', SetCollection));

// Provide access to main database object from any instance
defineProperty(Db.prototype, 'db', d('c', Db));

defineProperty(Db, 'fixed', d('c', function (fn) {
	callable(fn);
	return Db.Base.rel({ value: fn, fixedValue: true });
}));
