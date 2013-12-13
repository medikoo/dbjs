'use strict';

var resolvers         = require('./1.resolvers')
  , itemCreate        = require('./2.item-create')
  , itemResolveValue  = require('./3.item-resolve-value')
  , itemSetValue      = require('./4.item-set-value');

module.exports = function (db, createObj, obj, desc, item, descDesc, ac) {
	resolvers(obj, item);
	itemCreate(db, item, createObj);
	itemResolveValue(item);
	itemSetValue(db, item);
};
