'use strict';

var d                 = require('d/d')
  , isGetter          = require('../utils/is-getter')
  , updateEnum        = require('../utils/update-enumerability')
  , notifyDynamic     = require('../notify/dynamic')
  , notifyProperty    = require('../notify/property')
  , gatherReverseMaps = require('../utils/gather-reverse-maps')

  , defineProperties = Object.defineProperties;

module.exports = function (db, descriptor) {
	var property;

	property = defineProperties(descriptor.$getOwn('multiple'), {
		type: d('', db.Boolean),
		_value_: d('w', false)
	});

	defineProperties(property, {
		_sideNotify_: d(function (obj, pKey, key, nu, old, dbEvent, postponed) {
			var desc, value, data, sKey, item, revs, revMap, i
			  , nuResolved, oldResolved, nuValue, oldValue;

			if (!pKey) return postponed;
			desc = obj.__descriptors__[pKey];

			if (desc._reverse_) return postponed;
			if (desc.nested) return postponed;
			value = desc._resolveValueValue_();

			if (isGetter(value)) {
				// Dynamics
				postponed = notifyDynamic(obj, pKey, dbEvent, postponed);
				if (!obj.hasOwnProperty('__dynamicMultiples__')) return postponed;
				data = obj.__dynamicMultiples__[pKey];
				if (!data) return postponed;
				data._updateGetter_(nu ? value : null);
				return postponed;
			}

			if (value === undefined) updateEnum(obj, pKey, nu);

			postponed = notifyProperty(obj, pKey, nu ? null : value,
				nu ? value : null, function () {
					if (nuResolved) return nuValue;
					if (nu) nuValue = obj._getMultiple_(pKey);
					else if (value == null) nuValue = value;
					else nuValue = desc._normalizeValue_(value);
					nuResolved = true;
					return nuValue;
				}, function () {
					if (oldResolved) return oldValue;
					if (!nu) oldValue = obj._getMultiple_(pKey);
					else if (value == null) oldValue = value;
					else oldValue = desc._normalizeValue_(value);
					oldResolved = true;
					return oldValue;
				}, dbEvent, postponed);

			// Reverse
			revs = gatherReverseMaps(obj, pKey);
			if (!revs) return postponed;
			data = obj.__multiples__[pKey];
			if (!data) return postponed;
			for (sKey in data) {
				item = data[sKey];
				if (item._resolveValue_() == null) continue;
				for (i = 0; (revMap = revs[i]); ++i) {
					postponed = nu
						? revMap._addRef_(item._sKey_, item._key_, obj, dbEvent, postponed)
						: revMap._deleteRef_(item._sKey_, obj, dbEvent, postponed);
				}
			}
			return postponed;
		})
	});
};
