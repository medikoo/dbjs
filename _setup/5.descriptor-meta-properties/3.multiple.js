'use strict';

var d                 = require('d/d')
  , isGetter          = require('../utils/is-getter')
  , updateEnum        = require('../utils/update-enumerability')
  , notifyDynamic     = require('../notify/dynamic')
  , notifyProperty    = require('../notify/property')
  , gatherReverseMaps = require('../utils/gather-reverse-maps')

  , defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty;

module.exports = function (db, descriptor) {
	var property;

	property = defineProperties(descriptor.$getOwn('multiple'), {
		type: d('e', db.Boolean),
		_value_: d('w', false)
	});
	defineProperty(descriptor, 'multiple', descriptor._accessors_.multiple);

	defineProperties(property, {
		_sideNotify_: d(function (obj, pSKey, key, nu, old, dbEvent, postponed) {
			var desc, value, data, sKey, item, revs, revMap, i
			  , nuResolved, oldResolved, nuValue, oldValue;

			if (!pSKey) return postponed;
			desc = obj.__descriptors__[pSKey];
			if (!desc) desc = obj.__descriptorPrototype__;

			if (desc._reverse_) return postponed;
			if (desc.nested) return postponed;
			value = desc._resolveValueValue_();

			if (isGetter(value)) {
				// Dynamics
				postponed = notifyDynamic(obj, pSKey, dbEvent, postponed);
				if (!obj.hasOwnProperty('__dynamicMultiples__')) return postponed;
				data = obj.__dynamicMultiples__[pSKey];
				if (!data) return postponed;
				data._updateGetter_(nu ? value : null);
				return postponed;
			}

			if (value === undefined) updateEnum(obj, pSKey, nu);

			postponed = notifyProperty(obj, pSKey, nu ? null : value,
				nu ? value : null, function () {
					if (nuResolved) return nuValue;
					if (nu) nuValue = obj._getMultiple_(pSKey);
					else if (value == null) nuValue = value;
					else nuValue = desc._normalizeValue_(value);
					nuResolved = true;
					return nuValue;
				}, function () {
					if (oldResolved) return oldValue;
					if (!nu) oldValue = obj._getMultiple_(pSKey);
					else if (value == null) oldValue = value;
					else oldValue = desc._normalizeValue_(value);
					oldResolved = true;
					return oldValue;
				}, dbEvent, postponed);

			// Reverse
			revs = gatherReverseMaps(obj, pSKey);
			if (!revs) return postponed;
			data = obj.__multiples__[pSKey];
			if (!data) return postponed;
			for (sKey in data) {
				item = data[sKey];
				if (item._resolveValue_() == null) continue;
				for (i = 0; (revMap = revs[i]); ++i) {
					postponed = nu
						? revMap._addRef_(item._sKey_, item.key, obj, dbEvent, postponed)
						: revMap._deleteRef_(item._sKey_, obj, dbEvent, postponed);
				}
			}
			return postponed;
		})
	});
};
