'use strict';

var d                     = require('d/d')
  , getTypePropertyNotify = require('../utils/get-type-property-notify')
  , resolveValue          = require('../utils/resolve-value')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty

  , configure;

configure = function (name, descriptor, type, types, defValue) {
	var property, baseEmitValue, notify, notifyDesc, notifyDescs, notifyObjDescs;

	property = defineProperties(descriptor.$get(name), {
		type: d('', type),
		_value_: d('w', defValue)
	});

	baseEmitValue = property._emitValue_;
	notify = getTypePropertyNotify(types);

	notifyObjDescs = function (obj, desc, nt, ot, dbEvent, postponed) {
		if (!obj.hasOwnProperty('__descendants__')) return postponed;
		obj.__descendants__._plainForEach_(function (obj) {
			if (obj.hasOwnProperty('__descriptors__')) {
				if (hasOwnProperty.call(obj.__descriptors__, desc._sKey_)) return;
			}
			postponed = notify(obj, desc._sKey_, nt, ot, desc, desc,
				dbEvent, postponed);
			postponed = notifyObjDescs(obj, desc, nt, ot, dbEvent, postponed);
		});
		return postponed;
	};

	notifyDesc = function (desc, nt, ot, dbEvent, postponed) {
		postponed = notify(desc.__object__, desc._sKey_, nt, ot, desc, desc,
			dbEvent, postponed);
		return notifyObjDescs(desc.__object__, desc, nt, ot, dbEvent, postponed);
	};

	notifyDescs = function (desc, nt, ot, dbEvent, postponed) {
		if (!desc.hasOwnProperty('__descendants__')) return postponed;
		desc.__descendants__._plainForEach_(function (desc) {
			if ((desc.type === nt) && !desc._reverse_ && !desc.nested) {
				postponed = notifyDesc(desc, nt, ot, dbEvent, postponed);
			}
			postponed = notifyDescs(desc, nt, ot, dbEvent, postponed);
		});
		return postponed;
	};

	defineProperties(property, {
		_sideNotify_: d(function (obj, pKey, key, nu, old, dbEvent, postponed) {
			var desc, oldDesc;

			if (!pKey) return postponed;
			desc = obj.__descriptors__[pKey];
			oldDesc = { min: desc.max, max: desc.max, step: desc.step,
				pattern: desc.pattern };
			oldDesc[name] = old;

			return notify(obj, pKey, desc.type, desc.type, desc, oldDesc,
				dbEvent, postponed);
		}),
		_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
			postponed = baseEmitValue.call(this, obj, nu, old, dbEvent, postponed);
			getTypePropertyNotify.clear();
			return postponed;
		})
	});

	types.forEach(function (Type) {
		var baseEmitValue, desc;

		desc = defineProperties(Type.$get(name), {
			type: d('', type),
			_value_: d('w', defValue)
		});

		baseEmitValue = desc._emitValue_;

		defineProperties(desc, {
			_sideNotify_: d(function (obj, sKey, nu, old, nuGet, oldGet, dbEvent,
				postponed) {
				var desc = obj.__descriptors__[sKey], ot;

				if (desc.multiple) return postponed;
				if (nuGet) nu = resolveValue(obj, nu, true, desc.type, desc);
				if (oldGet) old = resolveValue(obj, old, true, desc.type, desc);

				ot = defineProperty(create(obj), name, d('', old));
				return notifyDescs(descriptor, obj, ot, dbEvent, postponed);
			}),
			_emitValue_: d(function (obj, nu, old, dbEvent, postponed) {
				postponed = baseEmitValue.call(this, obj, nu, old, dbEvent, postponed);
				getTypePropertyNotify.clear();
				return postponed;
			})
		});
	});
};

module.exports = function (db, descriptor) {
	configure('min', descriptor, db.Number, [db.Number, db.DateTime, db.String],
		-Infinity);
	configure('max', descriptor, db.Number, [db.Number, db.DateTime, db.String],
		Infinity);
	configure('step', descriptor, db.Number, [db.Number, db.DateTime], 0);
	configure('pattern', descriptor, db.RegExp, [db.String]);
};
