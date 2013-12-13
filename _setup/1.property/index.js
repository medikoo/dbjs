'use strict';

var defineObservable  = require('../utils/define-map-observable')
  , resolvers         = require('./1.resolvers')
  , descCreate        = require('./2.descriptor-create')
  , descResolveValue  = require('./3.descriptor-resolve-value')
  , descValidateValue = require('./4.descriptor-validate-value')
  , descSetValue      = require('./5.descriptor-set-value')
  , resolveProperty   = require('./6.resolve-property')
  , setProperty       = require('./7.set-property')
  , accessProperty    = require('./8.access-property');

module.exports = function (db, createObj, obj, desc, item, descDesc, ac) {
	resolvers(db, obj, desc);
	descCreate(db, createObj, desc);
	descResolveValue(desc, ac);
	descValidateValue(desc);
	descSetValue(db, desc);
	resolveProperty(obj, ac);
	setProperty(db, obj);
	accessProperty(obj);

	defineObservable(obj, function () {
		var data = this.__descriptors__, sKey, getter;
		for (sKey in data) {
			if (data[sKey].multiple) continue;
			getter = data[sKey]._resolveValueGetter_();
			if (!getter) continue;
			this._getDynamicValue_(sKey);
		}
	});
};
