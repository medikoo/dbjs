'use strict';

var d        = require('d')
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

	defineProperty(obj.$getOwn('_initialize_'), 'type', d('', db.Function));
	defineProperty(obj.$getOwn('toString'), 'type', d('', db.Function));
	defineProperty(Base.$getOwn('_validateExtendInitialize_'), 'type',
		d('', db.Function));
	defineProperty(Base.$getOwn('is'), 'type', d('', db.Function));
	defineProperty(Base.$getOwn('normalize'), 'type', d('', db.Function));
	defineProperty(Base.$getOwn('validate'), 'type', d('', db.Function));
	defineProperty(Base.$getOwn('_validateCreate_'), 'type', d('', db.Function));
};
