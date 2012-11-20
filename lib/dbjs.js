'use strict';

var d = require('es5-ext/lib/Object/descriptor')

  , dbjs;

// Import basic namespaces
require('./types/boolean');
require('./types/date-time');
require('./types/number');
require('./types/reg-exp');
require('./types/string');

// Export as object namespace
dbjs = module.exports = require('./types/object');

// Provide access to main database object from any instance
Object.defineProperty(dbjs.prototype, 'db', d('c', dbjs));
