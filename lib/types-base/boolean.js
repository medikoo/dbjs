'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , extend     = require('es5-ext/lib/Object/extend-properties')
  , Base       = require('./base')
  , StringType = require('./string')
  , define     = require('../_internals/define').define

  , BooleanType;

module.exports = BooleanType = Base.$$create('Boolean');
BooleanType.prototype._$create.$$setValue(Boolean);
BooleanType._is.$$setValue(function (value) {
	return (typeof value === 'boolean');
});
BooleanType._normalize.$$setValue(function (value) { return Boolean(value); });

Object.defineProperties(BooleanType, {
	coerce: d('c', BooleanType.normalize),
	_serialize_: d('c', function (value) { return '0' + Number(value); })
});

extend(BooleanType, Boolean);
extend(BooleanType.prototype, Boolean.prototype);
delete BooleanType.prototype.toString;
BooleanType.prototype._toString.$$setValue(function () {
	return this.valueOf() ? this.ns.trueString : this.ns.falseString;
});
define(BooleanType, 'trueString');
BooleanType._trueString.$$setValue('True');
BooleanType._trueString._ns.$$setValue(StringType);
BooleanType._trueString._required.$$setValue(true);
define(BooleanType, 'falseString');
BooleanType._falseString.$$setValue('False');
BooleanType._falseString._ns.$$setValue(StringType);
BooleanType._falseString._required.$$setValue(true);
