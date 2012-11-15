'use strict';

// Import basic namespaces
require('./types/boolean');
require('./types/date-time');
require('./types/function');
require('./types/number');
require('./types/reg-exp');
require('./types/string');

// Export as object namespace
module.exports = require('./types/object');
