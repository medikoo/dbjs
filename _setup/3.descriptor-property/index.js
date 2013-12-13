'use strict';

var defineObservable  = require('../utils/define-map-observable')
  , resolvers         = require('./1.resolvers')
  , descCreate        = require('./2.descriptor-create')
  , descResolveValue  = require('./3.descriptor-resolve-value')
  , descSetValue      = require('./4.descriptor-set-value')
  , resolveProperty   = require('./5.resolve-property')
  , setProperty       = require('./6.set-property')
  , accessProperty    = require('./7.access-property');

module.exports = function (db, createObj, obj, desc, item, descDesc, ac) {
	resolvers(obj, desc, descDesc);
	descCreate(descDesc, createObj);
	descResolveValue(descDesc);
	descSetValue(db, descDesc);
	resolveProperty(desc, descDesc, ac);
	setProperty(db, desc, descDesc);
	accessProperty(db, desc);
	defineObservable(desc);
};
