'use strict';

var d          = require('es5-ext/lib/Object/descriptor')
  , extend     = require('es5-ext/lib/Object/extend-properties')
  , Base       = require('./base')
  , NumberType = require('./number')

  , defineProperties = Object.defineProperties

  , BooleanType, proto, StringType, rel;

// Setup
module.exports = BooleanType = extend(Base.$$create('Boolean'), Boolean);
defineProperties(BooleanType, {
	_serialize_: d('c', function (value) { return '1' + Number(value); }),
	compare: d('c', NumberType.compare)
});
BooleanType._is.$$setValue(function (value) {
	return (typeof value === 'boolean');
});
BooleanType._normalize.$$setValue(Boolean);

proto = defineProperties(extend(BooleanType.prototype, Boolean.prototype), {
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
