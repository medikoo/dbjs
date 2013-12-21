'use strict';

var identity    = require('es5-ext/function/i')
  , isFunction  = require('es5-ext/function/is-function')
  , assign      = require('es5-ext/object/assign-multiple')
  , create      = require('es5-ext/object/create')
  , Set         = require('es6-set')
  , memoize     = require('memoizee/lib/regular')
  , memoizeDesc = require('memoizee/lib/d')(memoize)
  , d           = require('d/d')
  , lazy        = require('d/lazy')
  , uuid        = require('time-uuid')
  , MultiSet    = require('observable-multi-set/primitive')
  , DbjsError   = require('../error')
  , Event       = require('../event')
  , serialize   = require('../serialize/object')

  , slice = Array.prototype.slice
  , keys = Object.keys, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , isValidObjectName = RegExp.prototype.test.bind(/^[a-z][0-9a-zA-Z]*$/)
  , filter = function (obj) { return obj.constructor.prototype !== obj; }
  , filterValue = function (value) { return value == null; }
  , filterNull = function (value) { return value != null; }
  , getById, resolveFilter;

require('memoizee/lib/ext/resolvers');

resolveFilter = memoize(function (filter) {
	if (filter === undefined) return filterNull;
	if (filter === null) return filterValue;
	if (typeof filter === 'function') return filter;
	return function (value) { return value === filter; };
});

getById = function (proto, id) {
	var obj;
	if (!proto.hasOwnProperty('__descendants__')) return null;
	obj = proto.__descendants__.__setData__[id];
	if (obj) return obj;
	keys(proto.__descendants__.__setData__).some(function (key) {
		return (obj = getById(this[key], id));
	}, proto.__descendants__.__setData__);
	return obj;
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
		}),
		getById: d(function (id) { return getById(this.prototype, id); })
	}, memoizeDesc({
		filterByKey: d(function (key, filter) {
			var sKey = this._serialize_(key), set;
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			set = this.instances.filter(function (obj) {
				var observable, current;
				observable = obj._getObservable_(sKey);
				observable.on('change', function (event) {
					var value = event.newValue;
					value = Boolean(filter(value, obj));
					if (value === current) return;
					set.refresh(obj);
				});
				(current = Boolean(filter(observable.value, obj)));
				return current;
			});
			return set;
		}, {
			resolvers: [identity, resolveFilter],
			cacheName: '__filterByKey__',
			desc: ''
		})
	}), lazy({
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
