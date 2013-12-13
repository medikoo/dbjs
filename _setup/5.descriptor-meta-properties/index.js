'use strict';

var d        = require('d/d')
  , type     = require('./1.type')
  , required = require('./2.required')
  , multiple = require('./3.multiple')
  , nested   = require('./4.nested')
  , reverse  = require('./5.reverse')
  , unique   = require('./6.unique')
  , typeMeta = require('./7.type-meta')

  , defineProperty = Object.defineProperty;

module.exports = function (db, createObj, obj, desc, item, descDesc, ac) {
	var Base;

	type(db, desc);
	required(db, desc);
	multiple(db, desc);
	nested(db, desc);
	reverse(db, desc);
	unique(db, desc);
	typeMeta(db, desc);

	Base = db.Base;

	defineProperty(obj.$get('_initialize_'), 'type', d('', db.Function));
	defineProperty(obj.$get('toString'), 'type', d('', db.Function));
	defineProperty(Base.$get('_validateExtendInitialize_'), 'type',
		d('', db.Function));
	defineProperty(Base.$get('is'), 'type', d('', db.Function));
	defineProperty(Base.$get('normalize'), 'type', d('', db.Function));
	defineProperty(Base.$get('validate'), 'type', d('', db.Function));
	defineProperty(Base.$get('_validateCreate_'), 'type', d('', db.Function));
};
