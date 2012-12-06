'use strict';

var d      = require('es5-ext/lib/Object/descriptor')
  , extend = require('es5-ext/lib/Object/extend-properties')
  , Base   = require('./base')

  , BooleanType;

module.exports = BooleanType = Base.create('Boolean', function (value) {
	return Boolean(value && value.valueOf());
}, {
	is: function (value) { return (typeof value === 'boolean'); },
	normalize: function (value) { return Boolean(value); }
});

Object.defineProperties(BooleanType, {
	coerce: d('c', BooleanType.normalize),
	_serialize_: d('c', function (value) { return '0' + Number(value); })
});

extend(BooleanType, Boolean);
extend(BooleanType.prototype, Boolean.prototype);
delete BooleanType.prototype.toString;
BooleanType.prototype._toString.$set(Boolean.prototype.toString);
