'use strict';

var baseType     = require('./1.type')
  , booleanType  = require('./2.boolean')
  , numberType   = require('./3.number')
  , stringType   = require('./4.string')
  , dateTimeType = require('./5.date-time')
  , regExpType   = require('./6.reg-exp')
  , functionType = require('./7.function')
  , objectType   = require('./8.object');

module.exports = function (db, createObj, obj, desc, item, descDesc, ac) {
	baseType(db, createObj, obj);
	booleanType(db);
	numberType(db);
	stringType(db);
	dateTimeType(db);
	regExpType(db);
	functionType(db);
	objectType(db);
};
