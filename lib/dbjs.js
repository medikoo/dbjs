'use strict';

var d             = require('es5-ext/lib/Object/descriptor')
  , SetCollection = require('set-collection')

  , defineProperty = Object.defineProperty

  , dbjs;

// Import base types
require('./types-base/boolean');
require('./types-base/date-time');
require('./types-base/number');
require('./types-base/reg-exp');
require('./types-base/string');

// Export as object namespace
dbjs = module.exports = require('./types-base/object');

// Basic Set implementation for internal calculations
defineProperty(dbjs, 'Set', d('c', SetCollection));

// Provide access to main database object from any instance
defineProperty(dbjs.prototype, 'db', d('c', dbjs));
