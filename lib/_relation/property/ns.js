// NS property, special one, the only that is not backed by namespace

'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , extend   = require('es5-ext/lib/Object/extend-properties')
  , proto    = require('../../_proto').prototype
  , relation = require('../')
  , simple   = require('../simple')

  , rel, dscr, validate;

rel = simple(proto._defineRel_('ns'), relation);
Object.defineProperties(rel, {
	$setValue: d(function (value) {
		if (value === null) value = relation.__ns.__value;
		this.$$setValue(value);
		this._signal_(value);
	}),
	validateValue: d(validate = function (value) {
		if (!value || (typeof value !== 'function') ||
				(value._type_ !== 'namespace')) {
			return new TypeError(value + ' is not valid namespace');
		}
		return null;
	}),
	validateCreateValue: d(validate)
});
