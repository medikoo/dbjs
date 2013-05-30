'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , proto  = require('../_proto')
  , simple = require('./simple')

  , validate;

Object.defineProperties(simple(proto._defineRel_('toString')), {
	validateValue: d(validate = function (value) {
		if (!value || (typeof value !== 'function') || value._type_) {
			return new TypeError(value + ' is not valid function');
		}
		return null;
	}),
	validateCreateValue: d(validate)
}).$$setValue(function () { return '[dbjs ' + this._id_ + ']'; });
