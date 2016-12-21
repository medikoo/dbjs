'use strict';

var primitiveSet = require('es5-ext/object/primitive-set');

module.exports = primitiveSet('constructor', 'clear', 'database', 'delete', 'entries', 'forEach',
	'getDescriptor', 'has', 'key', 'keys', 'master', 'object', 'owner', 'set', 'size', 'values');
