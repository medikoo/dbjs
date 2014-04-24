'use strict';

var d              = require('d')
  , updateEnum     = require('../utils/update-enumerability')
  , notifyProperty = require('../notify/property')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty
  , notify, notifyDescs;

notify = function (obj, sKey, nu, map, dbEvent, postponed) {
	var has, nuResolved, oldResolved, nuVal, oldVal;

	has = map._anySingular_('7' + obj.__id__);
	if (has) {
		nuVal = oldVal = null;
	} else {
		updateEnum(obj, sKey, !nu);
		if (nu) oldVal = null;
		else nuVal = null;
	}

	return notifyProperty(obj, sKey, nuVal, oldVal, function () {
		if (nuResolved) return nuVal;
		nuVal = map.get(obj);
		nuResolved = true;
		return nuVal;
	}, function () {
		if (oldResolved) return oldVal;
		oldVal = nu
			? map._getSingular_('7' + obj.__id__)
			: map._getMultiple_('7' + obj.__id__, obj);
		oldResolved = true;
		return oldVal;
	}, dbEvent, postponed);
};

notifyDescs = function (obj, sKey, nu, map, dbEvent, postponed) {
	if (!obj.hasOwnProperty('__descendants__')) return postponed;
	obj.__descendants__._plainForEach_(function (obj) {
		postponed = notify(obj, sKey, nu, map, dbEvent, postponed);
		postponed = notifyDescs(obj, sKey, nu, map, dbEvent,
			postponed);
	});
	return postponed;
};

module.exports = function (db, descriptor) {
	var property, isObjectType = db.isObjectType;

	property = defineProperties(descriptor.$getOwn('unique'), {
		type: d('e', db.Boolean),
		_value_: d('w', false)
	});
	defineProperty(descriptor, 'unique', descriptor._accessors_.unique);

	defineProperties(property, {
		_sideNotify_: d(function (obj, pSKey, key, nu, old, dbEvent, postponed) {
			var desc, map, rKey;

			if (!pSKey) return postponed;
			desc = obj.__descriptors__[pSKey];
			if (!desc) desc = obj.__descriptorPrototype__;

			// Process reverse if applicable
			if (desc.reverse === undefined) return postponed;
			if (!isObjectType(desc.type)) return postponed;
			if (obj.constructor.prototype !== obj) return postponed;
			if (!isObjectType(obj.constructor)) return postponed;

			if (!map) map = obj._getReverseMap_(pSKey);
			rKey = obj._serialize_(desc.reverse);
			postponed = notify(desc.type.prototype, rKey, nu, map,
				dbEvent, postponed);
			return notifyDescs(desc.type.prototype, rKey, nu, map,
				dbEvent, postponed);
		})
	});
};
