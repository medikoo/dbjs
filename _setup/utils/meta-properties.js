'use strict';

var primitiveSet = require('es5-ext/object/primitive-set');

module.exports = primitiveSet('constructor', 'clear', 'database', 'delete',
	'entries', 'forEach', 'has', 'key', 'keys', 'master', 'object', 'set',
	'size', 'values');
