'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , Proto  = require('../_proto')
  , simple = require('./simple')

  , proto = Proto.prototype

  , validate;

Object.defineProperties(simple(Proto._defineRel_('toString')), {
	validateValue: d('c', validate = function (value) {
		if (!value || (typeof value !== 'function') || value._type_) {
			return new TypeError(value + ' is not valid function');
		}
		return null;
	}),
	validateCreateValue: d('c', validate)
}).$$setValue(Function.prototype.toString);

Object.defineProperties(simple(proto._defineRel_('toString')), {
	validateValue: d(validate),
	validateCreateValue: d(validate)
}).$$setValue(Object.prototype.toString);
