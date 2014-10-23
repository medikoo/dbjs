'use strict';

var isDate          = require('es5-ext/date/is-date')
  , identity        = require('es5-ext/function/identity')
  , isFunction      = require('es5-ext/function/is-function')
  , validFunction   = require('es5-ext/function/valid-function')
  , assign          = require('es5-ext/object/assign')
  , create          = require('es5-ext/object/create')
  , mixin           = require('es5-ext/object/mixin')
  , setPrototypeOf  = require('es5-ext/object/set-prototype-of')
  , isRegExp        = require('es5-ext/reg-exp/is-reg-exp')
  , d               = require('d')
  , lazy            = require('d/lazy')
  , DbjsError       = require('../error')
  , Event           = require('../event')
  , ObjectsSet      = require('../objects-set')
  , turnPrototype   = require('../utils/propagate-prototype-turn').object
  , serialize       = require('../serialize/value')
  , isGetter        = require('../utils/is-getter')
  , getMessage      = require('../utils/get-sub-error-message')
  , updateEnum      = require('../utils/update-enumerability')
  , resolveSKeyPath = require('../utils/resolve-property-path')
  , unserialize     = require('../unserialize/key')
  , notifyReverse   = require('../notify/reverse')
  , validDbValue    = require('../../valid-dbjs-value')
  , Extensions      = require('./extensions')

  , push = Array.prototype.push, slice = Array.prototype.slice
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty, keys = Object.keys
  , getPrototypeOf = Object.getPrototypeOf
  , isValidTypeName = RegExp.prototype.test.bind(/^[A-Z][0-9a-zA-Z]*$/)
  , typeMap = { boolean: 1, number: 2, string: 3, function: 4,  object: 4 }
  , getObjectType
  , destroy = function (sKey) { this[sKey]._destroy_(); }
  , initializeObject;

initializeObject = function (obj, postponed) {
	var sKey, descs = obj.__descriptors__, desc, set, iSKey, item, value
	  , resolve = function () { return desc._normalizeValue_(value); };
	for (sKey in descs) {
		desc = descs[sKey];
		if (desc._reverse_) continue;
		if (desc.nested || desc.multiple) updateEnum(obj, sKey, true);
		if (desc.nested) continue;
		if (isGetter(desc._value_)) continue;
		if (desc.multiple) {
			set = obj.__multiples__[sKey];
			if (!set) continue;
			for (iSKey in set) {
				item = set[iSKey];
				if (typeof item === 'number') {
					value = unserialize(iSKey);
				} else {
					value = item.key;
					if (!item._value_) continue;
					if (obj._normalize_(sKey, value) == null) continue;
				}
				postponed = notifyReverse(obj, sKey, value, null, null, null, iSKey,
					null, null, postponed);
			}
			continue;
		}
		value = desc._value_;
		if (value == null) continue;
		postponed = notifyReverse(obj, sKey, value, null, resolve, null, undefined,
			null, null, postponed);
	}
	return postponed;
};

getObjectType = function (value) {
	if (isDate(value)) return 4;
	if (isRegExp(value)) return 5;
	if (typeof value === 'function') return 6;
	return 7;
};

module.exports = function (db, createObj, object) {
	var Base, existingIds = db.objects.__setData__, extendNested, injectNested;

	Base = module.exports = function Self(value) {
		if ((arguments.length === 1) && Self.is(value)) return value;
		return Self.create.apply(Self, arguments);
	};
	setPrototypeOf(Base, object);
	try { mixin(Base, Function.prototype); } catch (ignore) {}

	defineProperties(Base, assign({
		__id__: d('', 'Base'),
		object: d('', Base),
		extend: d(function (name) {
			return this._extendAndInitialize_.apply(this,
				this._validateExtend_.apply(this, arguments));
		}),
		_validateExtend_: d(function (name) {
			if (!isValidTypeName(name)) {
				throw new DbjsError(name + " is not valid type name",
					'INVALID_TYPE_NAME');
			}
			if (existingIds[name]) {
				throw new DbjsError(name + " type is already created", 'TYPE_EXISTS');
			}
			return [name].concat(this._validateExtendInitialize_.apply(this,
				slice.call(arguments, 1)));
		}),
		_validateExtendInitialize_: d(function (initialize, nsProps, objProps) {
			var errors;
			if (!isFunction(initialize)) {
				objProps = nsProps;
				nsProps = initialize;
				initialize = null;
			} else if (!nsProps) {
				nsProps = { _initialize_: { value: initialize } };
			} else {
				nsProps._initialize_ = { value: initialize };
			}

			if (nsProps) {
				try {
					nsProps = create(this)._validateDefineProperties_(nsProps);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (e.errors) errors = e.errors;
					else errors = [e];
				}
			}
			if (objProps) {
				try {
					objProps =
						create(this.prototype)._validateDefineProperties_(objProps);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (errors) {
						if (e.errors) push.apply(errors, e.errors);
						else errors.push(e);
					} else {
						if (e.errors) errors = e.errors;
						else errors = [e];
					}
				}
			}
			if (!errors) return [nsProps, objProps];
			throw new DbjsError("Invalid properties:\n\t" +
				errors.map(getMessage).join('\t\n'), 'TYPE_CONSTRUCTION_ERROR',
				{ errors: errors });
		}),
		_extendAndInitialize_: d(function (name) {
			var constructor = this._extend_(name);
			new Event(constructor, this); //jslint: ignore
			constructor._initialize_.apply(constructor, slice.call(arguments, 1));
			return constructor;
		}),
		_initialize_: d(function (nsProps, objProps) {
			if (nsProps) this._defineProperties_(nsProps);
			if (objProps) this.prototype._defineProperties_(objProps);
		}),
		is: d(function (value) { return Boolean(serialize(value)); }),
		normalize: d(function (value) { return this.is(value) ? value : null; }),
		validate: d(function (value) {
			if (!serialize(value)) {
				throw new DbjsError(value + " cannot be handled by dbjs",
					'NOT_SUPPORTED_VALUE');
			}
			return value;
		}),
		compare: d(function (a, b) {
			var aType, bType;
			if (a == null) {
				if (b == null) return 0;
				return -Infinity;
			}
			if (b == null) return Infinity;
			aType = typeMap[typeof a];
			bType = typeMap[typeof b];
			if (aType !== bType) return aType - bType;
			if ((aType === 1) || (aType === 2)) return a - b;
			if (aType === 3) return String(a).localeCompare(b);
			aType = getObjectType(a);
			bType = getObjectType(b);
			if (aType !== bType) return aType - bType;
			if (aType === 4) return a - b;
			if ((aType === 5) || (aType === 6)) return String(a).localeCompare(b);
			return String(a.__id__).localeCompare(b.__id__);
		}),
		_extend_: d(function (name) {
			var postponed, constructor = function Self(value) {
				var result;
				if ((arguments.length === 1) && Self.is(value)) result = value;
				else result = Self.create.apply(Self, arguments);
				if (!Self.NativePrimitive) return result;
				if (typeof result === 'object') return result;
				if (typeof result === 'function') return result;
				if (!(this instanceof Self)) return result;
				result = new Self.NativePrimitive(result);
				return setPrototypeOf(result, Self.prototype);
			};
			setPrototypeOf(constructor, this);
			defineProperties(constructor, {
				__id__: d('', name),
				__valueId__: d('', name),
				object: d('', constructor),
				master: d('', constructor)
			});
			constructor.prototype = create(this.prototype, {
				constructor: d(constructor),
				__id__: d('', name + '#'),
				__valueId__: d('', name + '#')
			});
			defineProperties(constructor.prototype, {
				master: d('', constructor.prototype),
				object: d('', constructor.prototype)
			});
			db.objects._add(constructor);
			db.objects._add(constructor.prototype);
			this._descendants_._add(constructor);
			this.prototype._descendants_._add(constructor.prototype);
			if (!(name in db)) db[name] = constructor;
			postponed = initializeObject(constructor);
			db._release_(initializeObject(constructor.prototype, postponed));
			return constructor;
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old = getPrototypeOf(this), postponed;
			if (!nu) nu = Base;
			else validDbValue(validFunction(nu));
			if (old === nu) return;
			postponed = turnPrototype(this, nu, dbEvent);
			db._release_(turnPrototype(this.prototype, nu.prototype,
				dbEvent, postponed));
		}),
		create: d(function () {
			return this._createAndInitialize_.apply(this,
				this._validateCreate_.apply(this, arguments));
		}),
		_validateCreate_: d(function (value) { return [this.validate(value)]; }),
		_createAndInitialize_: d(identity),
		_create_: d(function (id, master) {
			return this.prototype._extend_(id, master);
		}),
		find: d(function (key, value) {
			var sKey = this._serialize_(key), sValue;
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			if (value == null) {
				throw new DbjsError(value + " is not a value", 'INVALID_VALUE');
			}
			sValue = serialize(value);
			if (sValue == null) {
				throw new DbjsError(value + " is invalid database value",
					'NOT_SUPPORTED_VALUE');
			}
			return this.prototype._getReverseMap_(sKey)._getMultiple_(sValue, value);
		}),
		_destroy_: d(function () {
			if (this.hasOwnProperty('__typeAssignments__')) {
				this.__typeAssignments__._plainForEach_(function (obj) {
					new Event(obj.$type); //jslint: ignore
				});
			}
			this.prototype._destroy_();
			this.prototype._destroy_.call(this);
		})
	}, lazy({
		_typeAssignments_: d(function () { return new ObjectsSet(); },
			{ cacheName: '__typeAssignments__', desc: '' }),
		extensions: d(function () {
			return new Extensions(this);
		}, { cacheName: '__extensions__', desc: '' })
	})));

	db.objects._add(Base);
	db.Base = Base;
	Base.prototype = object;

	extendNested = function (object) {
		var nested, desc, sKey = this.__sKey__;
		nested = this._extend_(object.__id__ + '/' + sKey, object.master);
		desc = object._getDescriptor_(sKey);
		if (!desc._reverse_ && desc.nested) updateEnum(object, sKey, true);
		return defineProperties(nested, {
			owner: d('', object)
		});
	};

	injectNested = function (obj, proto) {
		var sKey;
		if (!obj.hasOwnProperty('__descendants__')) return;
		sKey = proto.__sKey__;
		obj.__descendants__._plainForEach_(function (obj) {
			var desc, oldProto, nested;
			if (obj.hasOwnProperty('__descriptors__') &&
					hasOwnProperty.call(obj.__descriptors__, sKey)) {
				desc = obj.__descriptors__[sKey];
				if (desc.hasOwnProperty('__descriptors__') &&
						hasOwnProperty.call(desc.__descriptors__, 'type')) {
					if (desc.__descriptors__.type.hasOwnProperty('_value_')) {
						return;
					}
				}
			}
			if (obj.hasOwnProperty('__objects__') && obj.__objects__[sKey]) {
				nested = obj.__objects__[sKey];
				oldProto = getPrototypeOf(nested);
				setPrototypeOf(nested, proto);
				oldProto.__descendants__._delete(nested);
				proto._descendants_._add(nested);
				return;
			}
			injectNested(obj, proto);
		});
	};

	defineProperties(object, {
		constructor: d(Base),
		_extendNested_: d(function (object, sKey) {
			var nested, desc;
			if (!this._keys_[sKey]) this._serialize_(unserialize(sKey, db.objects));
			++db._postponed_;
			nested = this._extend_(object.__id__ + '/' + sKey, object.master);
			desc = object._getDescriptor_(sKey);
			if (!desc._reverse_ && desc.nested) updateEnum(object, sKey, true);
			defineProperties(nested, {
				owner: d('', object),
				key: d('', this._keys_[sKey]),
				__sKey__: d('', sKey),
				_extendNested_: d(extendNested)
			});
			injectNested(object, nested);
			--db._postponed_;
			return nested;
		}),
		_extend_: d(function (id, master) {
			var object, postponed, descs;
			descs = this._descendants_;
			descs._postponed_ += 1;
			postponed = [descs];
			object = createObj(this, id, id, null, master);
			db._release_(initializeObject(object, postponed));
			return object;
		}),
		_destroy_: d(function () {
			if (this.hasOwnProperty('__descendants__')) {
				this.__descendants__._plainForEach_(function (obj) {
					obj._destroy_();
				});
			}
			if (this.hasOwnProperty('__assignments__')) {
				this.__assignments__._plainForEach_(function (obj) {
					new Event(obj); //jslint: ignore
				});
			}
			if (this.hasOwnProperty('__objects__')) {
				keys(this.__objects__).forEach(destroy, this.__objects__);
			}
			if (this.hasOwnProperty('__descriptors__')) {
				keys(this.__descriptors__).forEach(destroy, this.__descriptors__);
			}
			if (this.hasOwnProperty('__multiples__')) {
				keys(this.__multiples__).forEach(function (pSKey) {
					keys(this[pSKey]).forEach(destroy, this[pSKey]);
				}, this.__multiples__);
			}
			if (this.constructor.prototype === this) return;
			if (this.__sKey__) return;
			new Event(this); //jslint: ignore
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old;
			if (this.constructor.prototype === this) {
				// Sanity check
				throw new DbjsError("Turn of prototype of the prototypes is forbidden",
					'PROTOTYPE_TURN');
			}
			old = getPrototypeOf(this);
			if (!nu) {
				nu = object;
			} else {
				validDbValue(nu);
				if (nu._kind_ !== 'object') {
					throw new DbjsError("Prototype must be object kind",
						'NON_OBJECT_PROTOTYPE');
				}
			}
			if (old === nu) return;
			db._release_(turnPrototype(this, nu, dbEvent));
		}),
		resolveSKeyPath: d(function (sKeyPath) { return resolveSKeyPath(this, sKeyPath); })
	});
};
