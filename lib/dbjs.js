'use strict';

var d             = require('es5-ext/lib/Object/descriptor')
  , validFunction = require('es5-ext/lib/Function/valid-function')
  , SetCollection = require('set-collection')
  , relation      = require('./_relation')
  , Base          = require('./types/base')
  , BooleanType   = require('./types/boolean')
  , FunctionType  = require('./types/function')
  , NumberType    = require('./types/number')
  , StringType    = require('./types/string')
  , ObjectType    = require('./types/object')

  , defineProperty = Object.defineProperty

  , Db;

require('./types/date-time');
require('./types/reg-exp');

// Assign namespaces
relation._required._ns.$$setValue(BooleanType);
relation._multiple._ns.$$setValue(BooleanType);
relation._writeOnce._ns.$$setValue(BooleanType);
relation._unique._ns.$$setValue(BooleanType);
relation._reverse._ns.$$setValue(StringType);
relation._tags._ns.$$setValue(StringType);
relation._triggers._ns.$$setValue(StringType);
relation._order._ns.$$setValue(NumberType);
relation._label._ns.$$setValue(StringType);
relation._itemPrototype_._order._ns.$$setValue(NumberType);
relation._itemPrototype_._label._ns.$$setValue(StringType);

Base._$construct._ns.$$setValue(FunctionType);
Base._validateConstruction._ns.$$setValue(FunctionType);
Base._is._ns.$$setValue(FunctionType);
Base._normalize._ns.$$setValue(FunctionType);

Base.prototype._$construct._ns.$$setValue(FunctionType);
Base.prototype._validateConstruction._ns.$$setValue(FunctionType);

// Export as object namespace
Db = module.exports = ObjectType;

// Basic Set implementation for internal calculations
defineProperty(Db, 'Set', d('c', SetCollection));

// Provide access to main database object from any instance
defineProperty(Db.prototype, 'db', d('c', Db));

defineProperty(Db, 'external', d('c', function (fn) {
	validFunction(fn);
	return Db.Base.rel({ value: fn, external: true });
}));
