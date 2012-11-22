'use strict';

var d             = require('es5-ext/lib/Object/descriptor')
  , SetCollection = require('set-collection')

  , defineProperty = Object.defineProperty

  , dbjs;

// Import basic namespaces
require('./types/boolean');
require('./types/date-time');
require('./types/number');
require('./types/reg-exp');
require('./types/string');

// Export as object namespace
dbjs = module.exports = require('./types/object');

// Basic Set implementation for internal calculations
defineProperty(dbjs, 'Set', d('c', SetCollection));

// Provide access to main database object from any instance
defineProperty(dbjs.prototype, 'db', d('c', dbjs));
