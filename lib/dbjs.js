'use strict';

var copy          = require('es5-ext/object/copy')
  , assign        = require('es5-ext/object/assign')
  , validFunction = require('es5-ext/function/valid-function')
  , d             = require('d/d')
  , SetCollection = require('set-collection')
  , proto         = require('./_proto')
  , relation      = require('./_relation')
  , Base          = require('./types/base')
  , BooleanType   = require('./types/boolean')
  , FunctionType  = require('./types/function')
  , NumberType    = require('./types/number')
  , StringType    = require('./types/string')
  , ObjectType    = require('./types/object')

  , Db;

require('./types/date-time');
require('./types/reg-exp');

// Assign namespaces
relation._required._ns.$$setValue(BooleanType);
relation._multiple._ns.$$setValue(BooleanType);
relation._writeOnce._ns.$$setValue(BooleanType);
relation._unique._ns.$$setValue(BooleanType);
relation._reverse._ns.$$setValue(StringType);
proto._tags._ns.$$setValue(StringType);
relation._triggers._ns.$$setValue(StringType);
relation._order._ns.$$setValue(NumberType);
relation._label._ns.$$setValue(StringType);
relation._trueLabel._ns.$$setValue(StringType);
relation._falseLabel._ns.$$setValue(StringType);

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
Object.defineProperties(Db, {
	Set: d('c', SetCollection),
	plainCopy: d('c', copy),
	plainExtend: d('c', assign),
	locale: d('cw', undefined),
	valueObjectMode: d('cw', false)
});

// Provide access to main database object from any instance
Object.defineProperty(proto, 'Db', d('c', Db));

Object.defineProperty(Db, 'external', d('c', function (fn) {
	validFunction(fn);
	return Db.Base.rel({ value: fn, external: true });
}));
