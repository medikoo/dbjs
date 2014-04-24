'use strict';

var create                = require('es5-ext/object/create')
  , d                     = require('d')
  , getTypePropertyNotify = require('../utils/get-type-property-notify')
  , resolveValue          = require('../utils/resolve-value')

  , hasOwnProperty = Object.prototype.hasOwnProperty
  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty

  , configure;

configure = function (name, descriptor, type, types, defValue) {
	var property, notify, notifyDesc, notifyObjDescs, notifyNamedDescs;

	property = defineProperties(descriptor.$getOwn(name), {
		type: d('e', type)
	});

	notify = getTypePropertyNotify(types);

	notifyObjDescs = function (obj, desc, nt, ot, dbEvent, postponed) {
		if (!obj.hasOwnProperty('__descendants__')) return postponed;
		obj.__descendants__._plainForEach_(function (obj) {
			if (obj.hasOwnProperty('__descriptors__')) {
				if (hasOwnProperty.call(obj.__descriptors__, desc._sKey_)) {
					desc = obj.__descriptors__[desc._sKey_];
					if (desc.hasOwnProperty('__descriptors__') &&
							hasOwnProperty.call(desc.__descriptors__, 'type') &&
							desc.__descriptors__.type.hasOwnProperty('_value_')) {
						return;
					}
				}
			}
			postponed = notify(obj, desc._sKey_, nt, ot, desc, desc,
				dbEvent, postponed);
			postponed = notifyObjDescs(obj, desc, nt, ot, dbEvent, postponed);
		});
		return postponed;
	};

	notifyDesc = function (desc, nt, ot, dbEvent, postponed) {
		postponed = notify(desc.object, desc._sKey_, nt, ot, desc, desc,
			dbEvent, postponed);
		return notifyObjDescs(desc.object, desc, nt, ot, dbEvent, postponed);
	};

	notifyNamedDescs = function (desc, nt, ot, dbEvent, postponed) {
		if (!desc.hasOwnProperty('__descendants__')) return postponed;
		desc.__descendants__._plainForEach_(function (desc) {
			if (desc._sKey_) postponed = notifyDesc(desc, nt, ot, dbEvent, postponed);
			else postponed = notifyNamedDescs(desc, nt, ot, dbEvent, postponed);
		});
		return postponed;
	};

	defineProperties(property, {
		_sideNotify_: d(function (obj, pSKey, key, nu, old, dbEvent, postponed) {
			var desc, oldDesc;

			if (!pSKey) return postponed;
			desc = obj.__descriptors__[pSKey];
			if (!desc) desc = obj.__descriptorPrototype__;

			oldDesc = { min: desc.max, max: desc.max, step: desc.step,
				pattern: desc.pattern };
			oldDesc[name] = old;

			return notify(obj, pSKey, desc.type, desc.type, desc, oldDesc,
				dbEvent, postponed);
		}),
		_postNotify_: d(function () { getTypePropertyNotify.clear(); })
	});

	types.forEach(function (Type) {
		var desc;

		desc = defineProperties(Type.$getOwn(name), {
			type: d('e', type),
			_value_: d('w', defValue)
		});

		defineProperties(desc, {
			_sideNotify_: d(function (obj, sKey, nu, old, nuGet, oldGet, dbEvent,
				postponed) {
				var desc = obj.__descriptors__[sKey], ot;
				if (!desc) desc = obj.__descriptorPrototype__;

				if (desc.multiple) return postponed;
				if (nuGet) nu = resolveValue(obj, nu, true, desc.type, desc);
				if (oldGet) old = resolveValue(obj, old, true, desc.type, desc);

				ot = defineProperty(create(obj), name, d('', old));
				if (!obj.hasOwnProperty('__typeAssignments__')) return postponed;
				obj.__typeAssignments__._plainForEach_(function (desc) {
					if (desc._sKey_) {
						postponed = notifyDesc(desc, obj, ot, dbEvent, postponed);
						return;
					}
					postponed = notifyNamedDescs(desc, obj, ot, dbEvent, postponed);
				});
				return postponed;
			}),
			_postNotify_: d(function () { getTypePropertyNotify.clear(); })
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
