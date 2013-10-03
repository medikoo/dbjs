'use strict';

var mixin      = require('es5-ext/object/mixin')
  , d          = require('d/d')
  , Base       = require('./base')
  , NumberType = require('./number')

  , defineProperties = Object.defineProperties

  , BooleanType, proto, StringType, rel;

// Setup
module.exports = BooleanType = Base.$$create('Boolean');
proto = BooleanType.prototype;
Object.defineProperty(BooleanType, 'prototype', d('', proto));
try { mixin(BooleanType, Boolean); } catch (ignore) {}

defineProperties(BooleanType, {
	_serialize_: d('c', function (value) { return '1' + Number(value); }),
	compare: d('c', NumberType.compare)
});
BooleanType._is.$$setValue(function (value) {
	return (typeof value === 'boolean');
});
BooleanType._normalize.$$setValue(Boolean);

defineProperties(mixin(proto, Boolean.prototype), {
	$create: d(Boolean),
	validateCreate: d(function (value) { return null; })
});
delete proto.toString;
proto._toString.$$setValue(function () {
	return this.valueOf() ? this.ns.trueString : this.ns.falseString;
});

// Properties
StringType = require('./string');
rel = BooleanType.get('trueLabel');
rel.$$setValue('True');
rel._ns.$$setValue(StringType);
rel._required.$$setValue(true);

rel = BooleanType.get('falseLabel');
rel.$$setValue('False');
rel._ns.$$setValue(StringType);
rel._required.$$setValue(true);
