'use strict';

var isFunction = require('es5-ext/function/is-function')
  , assign     = require('es5-ext/object/assign')
  , create     = require('es5-ext/object/create')
  , d          = require('d/d')
  , lazy       = require('d/lazy')
  , uuid       = require('time-uuid')
  , MultiSet   = require('observable-multi-set')
  , DbjsError  = require('../error')
  , Event      = require('../event')
  , serialize  = require('../serialize/object')

  , slice = Array.prototype.slice
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , isValidObjectName = RegExp.prototype.test.bind(/^[a-z][0-9a-zA-Z]*$/)
  , filter = function (obj) { return obj.constructor.prototype !== obj; };

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
			throw new DbjsError(value + " is not a " + this.__id__,
				'INVALID_OBJECT_TYPE');
		}),
		_createAndInitialize_: d(function (props) {
			var obj = this._create_(uuid());
			new Event(obj, this.prototype); //jslint: skip
			obj._initialize_.apply(obj, arguments);
			return obj;
		}),
		_validateCreate_: d(function (props) {
			if (props == null) return [];
			return [create(this.prototype)._validateSetProperties_(props)];
		}),
		newNamed: d(function (name) {
			var args, obj;
			if (!isValidObjectName(name)) {
				throw new DbjsError(name + " is not valid object name",
					'INVALID_OBJECT_NAME');
			}
			if (existingIds[name]) {
				throw new DbjsError(name + " name is already used",
					'OBJECT_NAME_TAKEN');
			}
			args = slice.call(arguments, 1);
			args = this._validateCreate_.apply(this, args);
			obj = this._create_(name);
			new Event(obj, this.prototype); //jslint: skip
			obj._initialize_.apply(obj, args);
			return obj;
		})
	}, lazy({
		instances: d(function () {
			var sets = new Set(), onAdd, onDelete, onChange, multi;
			onAdd = function (Constructor) {
				sets.add(Constructor.prototype._descendants_.filter(filter));
				Constructor._descendants_.on('change', onChange);
				Constructor._descendants_.forEach(onAdd);
			};
			onDelete = function (Constructor) {
				sets.delete(Constructor.prototype._descendants_.filter(filter));
				Constructor._descendants_.off('change', onChange);
				Constructor._descendants_.forEach(onDelete);
			};
			onChange = function (event) {
				var type = event.type;
				if (type === 'add') {
					onAdd(event.value);
					return;
				}
				if (type === 'delete') {
					onDelete(event.value);
					return;
				}
				// Must not happen, left for eventual awareness
				throw new Error("Unsupported event");
			};
			onAdd(this);
			multi = new MultiSet(sets, serialize);
			sets = multi.sets;
			return multi;
		}, { cacheName: '__instances__', desc: '' })
	})));

	defineProperties(ObjectType.prototype, {
		_initialize_: d(function (props) {
			if (props == null) return;
			this._setProperties_(props);
		})
	});

	defineProperty(db, 'isObjectType', d(function (Type) {
		if (Type === ObjectType) return true;
		return ObjectType.isPrototypeOf(Type);
	}));
};
