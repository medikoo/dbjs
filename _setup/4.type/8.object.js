'use strict';

var isFunction   = require('es5-ext/function/is-function')
  , assign       = require('es5-ext/object/assign')
  , create       = require('es5-ext/object/create')
  , d            = require('d')
  , lazy         = require('d/lazy')
  , uuid         = require('time-uuid')
  , DbjsError    = require('../error')
  , Event        = require('../event')
  , Instances    = require('./instances')
  , isObjectName = require('../utils/is-object-name')

  , slice = Array.prototype.slice
  , keys = Object.keys, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , uniqIdPrefix = 'abcdefghiklmnopqrstuvxyz'[Math.floor(Math.random() * 24)]
  , getById;

getById = function (proto, id) {
	var obj;
	if (!proto.hasOwnProperty('__descendants__')) return null;
	obj = proto.__descendants__.__setData__[id];
	if (obj) return obj;
	keys(proto.__descendants__.__setData__).some(function (key) {
		return (obj = getById(this[key], id));
	}, proto.__descendants__.__setData__);
	return obj || null;
};

module.exports = function (db) {
	var ObjectType = db.Base._extend_('Object')
	  , existingIds = db.objects.__setData__;

	defineProperties(ObjectType, assign({
		_validateExtendInitialize_: d(function (initialize, objProps, nsProps) {
			if (!isFunction(initialize)) {
				nsProps = objProps;
				objProps = initialize;
			} else if (!objProps) {
				objProps = { _initialize_: { value: initialize } };
			} else {
				objProps._initialize_ = { value: initialize };
			}
			return db.Base._validateExtendInitialize_.call(this, nsProps, objProps);
		}),
		is: d(function (value) {
			if (!value) return false;
			if (!(value instanceof this)) return false;
			if (value === value.constructor.prototype) return false;
			if (!value.__id__) return false;
			return true;
		}),
		normalize: d(function (value) {
			return this.is(value) ? value : null;
		}),
		validate: d(function (value) {
			if (this.is(value)) return value;
			throw new DbjsError(value + " is not a " + this.__id__, 'INVALID_OBJECT_TYPE');
		}),
		compare: d(function (a, b) {
			return String(a.__id__).localeCompare(b.__id__);
		}),
		_createAndInitialize_: d(function (props) {
			var obj;
			db._postponed_ += 1;
			obj = this._create_(uuid());
			new Event(obj, this.prototype); //jslint: ignore
			obj._initialize_.apply(obj, arguments);
			db._postponed_ -= 1;
			return obj;
		}),
		_validateCreate_: d(function (props) {
			if (props == null) return [];
			return [create(this.prototype)._validateSetProperties_(props)];
		}),
		newNamed: d(function (name) {
			var args, obj;
			if (!isObjectName(name)) {
				throw new DbjsError(name + " is not valid object name", 'INVALID_OBJECT_NAME');
			}
			if (existingIds[name]) {
				throw new DbjsError(name + " name is already used", 'OBJECT_NAME_TAKEN');
			}
			args = slice.call(arguments, 1);
			args = this._validateCreate_.apply(this, args);
			obj = this._create_(name);
			new Event(obj, this.prototype); //jslint: ignore
			obj._initialize_.apply(obj, args);
			if (!db.hasOwnProperty(name)) defineProperty(db, name, d(obj));
			return obj;
		}),
		getById: d(function (id) { return getById(this.prototype, id); }),
		filterByKey: d(function (key, filter) {
			return this.instances.filterByKey(key, filter);
		})
	}, lazy({
		instances: d(function () {
			return new Instances(this);
		}, { cacheName: '__instances__', desc: '' })
	})));

	defineProperties(ObjectType.prototype, {
		_initialize_: d(function (props) {
			if (props == null) return;
			this._setProperties_(props);
		}),
		newUniq: d(function () {
			var Type = this.__descriptorPrototype__.type;
			if (!db.isObjectType(Type)) {
				throw new DbjsError("newUniq is applicable only to nested maps", 'NON_MAP_UNIQUE');
			}
			return this.get(uniqIdPrefix + uuid());
		})
	});

	defineProperty(db, 'isObjectType', d(function (Type) {
		if (Type === ObjectType) return true;
		return ObjectType.isPrototypeOf(Type);
	}));
};
